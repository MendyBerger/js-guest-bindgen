# Architecture

## The generator

For a WIT world, [`guest_bindgen`](./src/lib.rs) returns:

- an ES module of JS bindings that lift and lower every import and export,
  handle resources, and check that the user's module exports what the world
  requires. It exports `bindExports(sourceModule)`, plus the imported
  interfaces for the user's module to import.
- the core function signatures the embedding has to provide or call.

The embedding supplies the rest:

- the core exports, which call the JS export functions that `bindExports`
  hands to the [`GuestOpts::on_bind`](./src/lib.rs) hook,
- a `$import_<binding>` JS function for each core import, and a
  `$resource_<binding>` JS function for each `[resource-new]`,
  `[resource-rep]` and `[resource-drop]` import,
- the memory, realloc and dealloc globals named in `GuestOpts`, and any
  intrinsics it overrides, such as `dataView`.

## The vendored js-component-bindgen

[`vendor/js-component-bindgen`](./vendor/js-component-bindgen) adds the
`memoryView` and `memoryWrite` intrinsics, and `dataView` for list lowering,
which are not in a release. To see every change:

```sh
grep -rn "FORK(js-guest-bindgen)" vendor/js-component-bindgen
```

It is `publish = false`, so js-guest-bindgen cannot be published to crates.io
until the hooks are released or the fork is published under its own name.

## The embeddings

Each embedding has a generator that runs `guest_bindgen` and writes the core
exports and imports in its own language, and a `prelude.js` that overrides
the memory and string intrinsics. None of the engines can view linear memory
as an `ArrayBuffer`, so the prelude reads and writes it through native
functions and copies lists and strings in and out. The bindings call
`$wit_register`, the `on_bind` hook, to hand each export function to the
native side. None of them support 64-bit integers yet.

- [`boa`](./examples/embeddings/boa): `build.rs` generates the Rust core
  exports and imports. `src/lib.rs` creates the Boa context on the first
  export call, registers `__wit_*` native functions, and loads the bindings
  and `app.js` as modules. It targets `wasm32-wasip2`: on `wasm32-wasip3`
  every export call runs on a new thread with fresh thread-local storage,
  which loses Boa's state.
- [`porffor`](./examples/embeddings/porffor): `src/main.rs` generates the C
  core exports and imports, embedded in the JS through `Porffor.c` template
  literals, so porffor compiles both together. esbuild bundles the bindings
  with `app.js` first. It targets `wasm32-wasip3`, and `build.sh` downloads a
  pinned porffor and applies a one-hunk patch for wasi-libc's `mmap`.
- [`static-hermes`](./examples/embeddings/static-hermes): `src/main.rs`
  generates the C++ core exports and imports, and `src/embedding.cpp`
  registers the same `__wit_*` native functions as Boa, through JSI. esbuild
  bundles the bindings with `app.js`, and shermes compiles the bundle to C.
  Hermes does not build for WASI, so `build-hermes.sh` downloads a pinned
  commit, applies a small patch that treats WASI like Emscripten, and
  force-includes stubs for what wasi-libc lacks. It targets `wasm32-wasip2`.

None of the embeddings use wit-bindgen, so each passes the world to the
linker with `--component-type`, and the linker (`wasm-component-ld`, from
wasi-sdk and Rust's wasip2 target) produces the component directly.

## The test runner

[`examples/test-runner`](./examples/test-runner) is a wasmtime embedding that
runs any of the components: it provides the `logger` resource and calls every
export, checking the results, including resources passed in both directions
and dropped from JS with `Symbol.dispose`. It supports both wasip2 and wasip3
components.

## Tests

```sh
cargo test
# also run the vendored fork's tests:
cargo test --workspace
# after an intended change to the generated JS:
BLESS=1 cargo test --test snapshots
```

The [snapshot tests](./tests/snapshots) show the JS the generator produces for
a few worlds.
