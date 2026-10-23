//! Generates the JS bindings for a WIT world with js-guest-bindgen, and the
//! C++ core exports/imports that connect them to the component model.
//!
//! The bindings reach linear memory and the core imports through the native
//! `__wit_*` functions registered by `embedding.cpp`. esbuild bundles them
//! with the source module, and shermes compiles the bundle to C.
//!
//! Usage: static-hermes <wit> --source <module.js> --out-dir <dir> [--world <name>]

use std::fmt::Write as _;
use std::path::PathBuf;

use anyhow::{Context, Result, bail};
use js_guest_bindgen::{CoreFn, CoreTy, GuestOpts, guest_bindgen};
use wit_parser::Resolve;

macro_rules! uwriteln {
    ($dst:expr, $($arg:tt)*) => {
        writeln!($dst, $($arg)*).unwrap()
    };
}

/// Intrinsics provided by `prelude.js`, since JSI cannot view linear memory
const OVERRIDDEN_INTRINSICS: &[&str] = &[
    "dataView",
    "memoryView",
    "memoryWrite",
    "TEXT_DECODER_UTF8",
    "_utf8AllocateAndEncode",
];

const PRELUDE_JS: &str = include_str!("prelude.js");

fn main() -> Result<()> {
    let mut args = std::env::args().skip(1);
    let (mut wit, mut source, mut out_dir, mut world) = (None, None, None, None);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--source" => source = args.next(),
            "--out-dir" => out_dir = args.next(),
            "--world" => world = args.next(),
            _ if wit.is_none() => wit = Some(arg),
            _ => bail!("unexpected argument {arg}"),
        }
    }
    let usage = "usage: static-hermes <wit> --source <module.js> --out-dir <dir> [--world <name>]";
    let wit = PathBuf::from(wit.context(usage)?);
    let source = std::fs::canonicalize(source.context(usage)?).context("--source")?;
    let out_dir = PathBuf::from(out_dir.context(usage)?);

    let mut resolve = Resolve::default();
    let (pkg, _) = resolve.push_path(&wit)?;
    let world = resolve.select_world(&[pkg], world.as_deref())?;
    let opts = GuestOpts {
        overridden_intrinsics: OVERRIDDEN_INTRINSICS.iter().map(|s| s.to_string()).collect(),
        on_bind: Some("$wit_register".into()),
        ..GuestOpts::default()
    };
    let bindings = guest_bindgen(&resolve, world, &opts)?;

    let mut cpp = String::from("#include \"embedding.h\"\n\n");
    let mut js = String::new();

    // exports: core function the host calls -> JS binding registered as callback i
    let mut register = String::from("function $wit_register() {\n");
    for (i, (name, item)) in bindings.exports.iter().enumerate() {
        let canon = item.resource.canon_string(&item.name);
        let core_name = if item.iface { format!("{name}#{canon}") } else { canon };
        let CoreFn { params, ret, retptr, retsize, .. } = &item.func;
        let mut args: Vec<String> = (0..params.len()).map(|n| format!("(double)a{n}")).collect();
        uwriteln!(
            cpp,
            "extern \"C\" __attribute__((export_name(\"{core_name}\")))\n{} wit_export_{i}({}) {{",
            cpp_ret(ret)?,
            cpp_params(params)?
        );
        if *retptr {
            uwriteln!(cpp, "  int32_t rp = alloc_ret({retsize});");
            args.push("(double)rp".into());
        }
        uwriteln!(
            cpp,
            "  double args[] = {{ {} }};\n  double r = call_export({i}, args, {});",
            if args.is_empty() { "0".to_string() } else { args.join(", ") },
            args.len()
        );
        match ret {
            _ if *retptr => uwriteln!(cpp, "  (void)r;\n  return rp;\n}}"),
            Some(ty) => uwriteln!(cpp, "  free_tracked();\n  return ({})(int64_t)r;\n}}", cpp_ty(ty)?),
            None => uwriteln!(cpp, "  (void)r;\n  free_tracked();\n}}"),
        }
        if *retptr {
            uwriteln!(
                cpp,
                "extern \"C\" __attribute__((export_name(\"cabi_post_{core_name}\")))\nvoid wit_post_{i}(int32_t rp) {{\n  free((void *)(uintptr_t)rp);\n  free_tracked();\n}}"
            );
        }
        uwriteln!(register, "  __wit_register({i}, {});", item.binding_name);
    }
    register.push_str("}\n");
    uwriteln!(cpp, "const size_t EXPORT_COUNT = {};\n", bindings.exports.len());

    // imports: JS binding -> call_import(i) -> core import. Bindings use the
    // export ABI, so the return area is provided here and handed back to JS.
    let mut dispatch =
        String::from("double call_import(size_t i, const double *a) {\n  switch (i) {\n");
    for (i, ((_, item), binding)) in
        bindings.imports.iter().zip(&bindings.import_bindings).enumerate()
    {
        let module = item.core_module.as_deref().unwrap();
        let canon = item.resource.canon_string(&item.name);
        let CoreFn { params, ret, retptr, retsize, .. } = &item.func;
        uwriteln!(
            cpp,
            "extern \"C\" __attribute__((import_module(\"{module}\"), import_name(\"{canon}\")))\n{} wit_import_{i}({});",
            cpp_ret(ret)?,
            cpp_params(params)?
        );
        let js_params = &params[..params.len() - *retptr as usize];
        let mut call_args: Vec<String> = js_params
            .iter()
            .enumerate()
            .map(|(n, ty)| from_double(ty, &format!("a[{n}]")))
            .collect::<Result<_>>()?;
        uwriteln!(dispatch, "  case {i}: {{");
        if *retptr {
            uwriteln!(dispatch, "    int32_t rp = alloc_ret({retsize});");
            call_args.push("rp".into());
        }
        let call = format!("wit_import_{i}({})", call_args.join(", "));
        match ret {
            _ if *retptr => uwriteln!(dispatch, "    {call};\n    free_tracked();\n    return rp;"),
            Some(_) => uwriteln!(dispatch, "    double r = {call};\n    free_tracked();\n    return r;"),
            None => uwriteln!(dispatch, "    {call};\n    free_tracked();\n    return 0;"),
        }
        dispatch.push_str("  }\n");
        uwriteln!(js, "function $import_{binding}(...args) {{ return __wit_import({i}, ...args); }}");
    }
    dispatch.push_str("  }\n  __builtin_unreachable();\n}\n");
    cpp.push_str(&dispatch);

    // [resource-new], [resource-rep] and [resource-drop] intrinsics
    let mut dispatch =
        String::from("double call_resource(size_t i, int32_t h) {\n  switch (i) {\n");
    for (i, ((module, name, nret), binding)) in
        bindings.resource_imports.iter().zip(&bindings.resource_bindings).enumerate()
    {
        let ret = if *nret == 0 { "void" } else { "int32_t" };
        uwriteln!(
            cpp,
            "extern \"C\" __attribute__((import_module(\"{module}\"), import_name(\"{name}\")))\n{ret} wit_resource_{i}(int32_t);"
        );
        if *nret == 0 {
            uwriteln!(dispatch, "  case {i}:\n    wit_resource_{i}(h);\n    return 0;");
        } else {
            uwriteln!(dispatch, "  case {i}:\n    return wit_resource_{i}(h);");
        }
        uwriteln!(js, "function $resource_{binding}(h) {{ return __wit_resource({i}, h); }}");
    }
    dispatch.push_str("  }\n  __builtin_unreachable();\n}\n");
    cpp.push_str(&dispatch);

    // wit.js holds everything, wit-imports/*.js re-export each imported interface
    std::fs::create_dir_all(out_dir.join("wit-imports"))?;
    let mut wit_js = format!("{PRELUDE_JS}\n{js}\n{register}\n{}", bindings.js_bindings);
    let mut aliases = String::new();
    for (specifier, list) in &bindings.import_modules {
        let locals: Vec<&str> = list.split(", ").map(|s| s.split(" as ").next().unwrap()).collect();
        uwriteln!(wit_js, "\nexport {{ {} }};", locals.join(", "));
        let file = out_dir.join("wit-imports").join(format!("{}.js", sanitize(specifier)));
        std::fs::write(&file, format!("export {{ {list} }} from '../wit.js';\n"))?;
        uwriteln!(aliases, "--alias:{specifier}={}", std::fs::canonicalize(&file)?.display());
    }
    std::fs::write(out_dir.join("wit.js"), wit_js)?;
    std::fs::write(out_dir.join("esbuild-aliases.txt"), aliases)?;
    std::fs::write(out_dir.join("bindings.cpp"), cpp)?;
    std::fs::write(
        out_dir.join("main.js"),
        format!(
            "import {{ bindExports }} from './wit.js';\nimport * as $source_mod from '{}';\nbindExports($source_mod);\n",
            source.display()
        ),
    )?;
    Ok(())
}

fn sanitize(s: &str) -> String {
    s.chars().map(|c| if c.is_alphanumeric() { c } else { '_' }).collect()
}

fn cpp_ty(ty: &CoreTy) -> Result<&'static str> {
    Ok(match ty {
        CoreTy::I32 => "int32_t",
        CoreTy::F32 => "float",
        CoreTy::F64 => "double",
        CoreTy::I64 => bail!("64-bit core values are not supported yet"),
    })
}

fn cpp_ret(ty: &Option<CoreTy>) -> Result<&'static str> {
    ty.as_ref().map_or(Ok("void"), cpp_ty)
}

fn cpp_params(params: &[CoreTy]) -> Result<String> {
    let params: Vec<String> = params
        .iter()
        .enumerate()
        .map(|(n, ty)| Ok(format!("{} a{n}", cpp_ty(ty)?)))
        .collect::<Result<_>>()?;
    Ok(params.join(", "))
}

fn from_double(ty: &CoreTy, value: &str) -> Result<String> {
    Ok(match ty {
        CoreTy::I32 => format!("(int32_t)(int64_t){value}"),
        CoreTy::F32 => format!("(float){value}"),
        CoreTy::F64 => value.to_string(),
        CoreTy::I64 => bail!("64-bit core values are not supported yet"),
    })
}
