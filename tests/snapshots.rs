//! Snapshot tests for `js_guest_bindgen`.
//!
//! Each `tests/snapshots/<name>.wit` is generated with the default options and
//! compared against `tests/snapshots/<name>.js`, which also lists the core
//! functions the embedding has to provide. Run with `BLESS=1` to update the
//! snapshots after an intended change:
//!
//! ```sh
//! BLESS=1 cargo test --test snapshots
//! ```

use std::fmt::Write as _;
use std::path::{Path, PathBuf};

use anyhow::{Context as _, Result};
use js_guest_bindgen::{CoreFn, CoreTy, GuestBindings, GuestOpts, guest_bindgen};
use wit_parser::Resolve;

fn generate(wit: &str, opts: &GuestOpts) -> Result<GuestBindings> {
    let mut resolve = Resolve::default();
    let pkg = resolve.push_str("test.wit", wit)?;
    let world = resolve.select_world(&[pkg], None)?;
    guest_bindgen(&resolve, world, opts)
}

fn core_ty(ty: &CoreTy) -> &'static str {
    match ty {
        CoreTy::I32 => "i32",
        CoreTy::I64 => "i64",
        CoreTy::F32 => "f32",
        CoreTy::F64 => "f64",
    }
}

fn signature(func: &CoreFn) -> String {
    let params: Vec<&str> = func.params.iter().map(core_ty).collect();
    let mut sig = format!("({})", params.join(", "));
    if let Some(ret) = &func.ret {
        write!(sig, " -> {}", core_ty(ret)).unwrap();
    }
    if func.retptr {
        write!(sig, " [retptr {} bytes]", func.retsize).unwrap();
    }
    sig
}

/// The snapshot: a header describing the core functions, then the JS
fn render(name: &str, b: &GuestBindings) -> String {
    let mut out = format!(
        "// Generated from {name}.wit by tests/snapshots.rs. Do not edit;\n\
         // run with BLESS=1 to update.\n//\n// core exports (JS function the embedding calls):\n"
    );
    for (export, item) in &b.exports {
        let canon = item.resource.canon_string(&item.name);
        let core = if item.iface {
            format!("{export}#{canon}")
        } else {
            canon
        };
        writeln!(
            out,
            "//   {core}{} -> {}",
            signature(&item.func),
            item.binding_name
        )
        .unwrap();
    }
    out.push_str("//\n// core imports (JS function the embedding provides):\n");
    for ((_, item), binding) in b.imports.iter().zip(&b.import_bindings) {
        let module = item.core_module.as_deref().unwrap();
        let canon = item.resource.canon_string(&item.name);
        writeln!(
            out,
            "//   {module} {canon}{} <- $import_{binding}",
            signature(&item.func)
        )
        .unwrap();
    }
    for ((module, name, nret), binding) in b.resource_imports.iter().zip(&b.resource_bindings) {
        let ret = if *nret == 0 { "" } else { " -> i32" };
        writeln!(out, "//   {module} {name}(i32){ret} <- $resource_{binding}").unwrap();
    }
    out.push_str("//\n// import modules:\n");
    for (specifier, list) in &b.import_modules {
        writeln!(out, "//   {specifier}: {list}").unwrap();
    }
    out.push('\n');
    out.push_str(b.js_bindings.trim_start());
    out
}

#[test]
fn snapshots() -> Result<()> {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests/snapshots");
    let bless = std::env::var_os("BLESS").is_some();
    let mut wits: Vec<PathBuf> = std::fs::read_dir(&dir)?
        .map(|e| e.map(|e| e.path()))
        .collect::<Result<_, _>>()?;
    wits.retain(|p| p.extension().is_some_and(|e| e == "wit"));
    wits.sort();
    assert!(!wits.is_empty(), "no .wit files in {}", dir.display());

    let mut mismatched = Vec::new();
    for wit in &wits {
        let name = wit.file_stem().unwrap().to_str().unwrap();
        let bindings = generate(&std::fs::read_to_string(wit)?, &GuestOpts::default())
            .with_context(|| format!("generating {name}.wit"))?;
        let actual = render(name, &bindings);
        let snapshot = wit.with_extension("js");
        if bless {
            std::fs::write(&snapshot, &actual)?;
        } else if std::fs::read_to_string(&snapshot).ok().as_deref() != Some(actual.as_str()) {
            mismatched.push(snapshot.display().to_string());
        }
    }
    assert!(
        mismatched.is_empty(),
        "generated JS differs from (or is missing) {mismatched:?}; \
         rerun with BLESS=1 to update and review the diff"
    );
    Ok(())
}

const SIMPLE: &str = "
    package example:simple;
    world simple {
        export greet: func(name: string) -> string;
    }
";

#[test]
fn overridden_intrinsics_are_not_rendered() -> Result<()> {
    let default = generate(SIMPLE, &GuestOpts::default())?;
    assert!(default.js_bindings.contains("const memoryView ="));

    let opts = GuestOpts {
        overridden_intrinsics: vec!["memoryView".into()],
        ..GuestOpts::default()
    };
    let overridden = generate(SIMPLE, &opts)?;
    assert!(!overridden.js_bindings.contains("const memoryView ="));
    // still called, so the embedding's definition is used
    assert!(overridden.js_bindings.contains("memoryView("));
    Ok(())
}

#[test]
fn on_bind_is_called_by_bind_exports() -> Result<()> {
    let default = generate(SIMPLE, &GuestOpts::default())?;
    assert!(!default.js_bindings.contains("$register()"));

    let opts = GuestOpts {
        on_bind: Some("$register".into()),
        ..GuestOpts::default()
    };
    let js = generate(SIMPLE, &opts)?.js_bindings;
    let bind = &js[js.find("export function bindExports").unwrap()..];
    assert!(bind.contains("$register();"));
    Ok(())
}

#[test]
fn memory_names_come_from_opts() -> Result<()> {
    let opts = GuestOpts {
        memory: "$mem".into(),
        realloc: "$alloc".into(),
        dealloc: "$free".into(),
        ..GuestOpts::default()
    };
    let js = generate(SIMPLE, &opts)?.js_bindings;
    assert!(js.contains("$mem"));
    assert!(js.contains("$alloc"));
    assert!(!js.contains("$memory"));
    assert!(!js.contains("$realloc"));
    Ok(())
}

#[test]
fn async_functions_are_rejected() {
    let wit = "
        package example:tasks;
        world tasks {
            export run: async func();
        }
    ";
    let err = generate(wit, &GuestOpts::default()).unwrap_err();
    assert!(err.to_string().contains("async function `run`"), "{err}");
}
