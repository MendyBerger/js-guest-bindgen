# Static Hermes guest with js-guest-bindgen

The same component as [`boa`](../boa) and [`porffor`](../porffor):
JavaScript ([`app.js`](../../app.js)) implementing
[`wit/world.wit`](../../wit/world.wit), which exports a resource (`counter`)
and imports one (`logger`). Here the JS is compiled ahead of time to C by
[Static Hermes](https://github.com/facebook/hermes) (`shermes`), and runs on
the Hermes VM, built for WASI.

- [`src/main.rs`](./src/main.rs) runs [`js-guest-bindgen`](../../..) over the
  world and generates the core exports and imports in C++
  (`out/bindings.cpp`). esbuild bundles the bindings with `app.js`, and
  shermes compiles the bundle to C as an exported unit.
- [`src/embedding.cpp`](./src/embedding.cpp) creates the Hermes runtime on the
  first export call, registers native functions through JSI, and evaluates
  the compiled unit.
- JSI cannot view the component's linear memory as an `ArrayBuffer`, so
  [`src/prelude.js`](./src/prelude.js) replaces the `dataView`, `memoryView`,
  `memoryWrite` and UTF-8 intrinsics with those native functions. It also
  defines `Symbol.dispose`, which Hermes does not have yet.

The component targets `wasm32-wasip2`, with wasm exceptions for JSI's C++
exceptions and Hermes's `setjmp`.

## Hermes on WASI

Hermes builds for Emscripten but not for WASI, so
[`build-hermes.sh`](./build-hermes.sh), which `build.sh` runs when Hermes isn't
built yet, adapts it:

- [`hermes/wasi.patch`](./hermes/wasi.patch) treats WASI like Emscripten
  where Hermes picks a platform (OS compatibility, process stats, the
  sampling profiler, two llvh path functions), and runs the finalizer
  executor's tasks inline, since WASI has no threads. The script downloads
  the `static_h` commit the patch is made against and applies it there.
- [`hermes/compat`](./hermes/compat) is force-included into every Hermes
  source: stubs for the process, signal and user functions that wasi-libc
  lacks and llvh references, and includes libc++ no longer provides
  transitively.

## Build and run

Requires [wasi-sdk][wasi-sdk] with wasm exceptions (34 or newer), CMake and
Ninja, and Node.js for esbuild. The first build downloads Hermes and builds it
twice (for this machine and for wasm) into `out/hermes`, which takes a while.

```sh
WASI_SDK_PATH=path/to/wasi-sdk ./build.sh
cd ../../test-runner && cargo run -- ../embeddings/static-hermes/out/component.wasm
```

[wasi-sdk]: https://github.com/WebAssembly/wasi-sdk
