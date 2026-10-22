# Porffor guest with js-guest-bindgen

The same component as [`boa`](../boa): JavaScript
([`app.js`](../../app.js)) implementing [`wit/world.wit`](../../wit/world.wit), which
exports a resource (`counter`) and imports one (`logger`). Here the JS is
compiled ahead of time by [Porffor](https://porffor.dev) to C, and then to
wasm with wasi-sdk.

- [`src/main.rs`](./src/main.rs) runs
  [`js-guest-bindgen`](../../..) over the world and generates the core exports
  and imports in C. The C is embedded in the JS through `Porffor.c` template
  literals, so porffor compiles both together.
- Porffor has no wasm memory object, so
  [`src/prelude.js`](./src/prelude.js) replaces the `dataView`, `memoryView`,
  `memoryWrite` and UTF-8 intrinsics with functions that access linear memory
  through `Porffor.c`. [`src/prelude.c`](./src/prelude.c) has the C helpers
  they use.

The component targets `wasm32-wasip3`, with wasm exceptions for porffor's
`try`/`catch`.

## Build and run

Requires a [porffor](https://github.com/CanadaHonk/porffor) checkout,
[wasi-sdk][wasi-sdk] with `wasm32-wasip3` support,
[`wasm-tools`][wasm-tools] 1.262 or newer, and Node.js for porffor and
esbuild.

```sh
PORFFOR=path/to/porffor WASI_SDK_PATH=path/to/wasi-sdk ./build.sh
cd ../../test-runner && cargo run -- ../embeddings/porffor/out/component.wasm
```

`build.sh` generates `out/wit.js` and `out/main.js`, bundles them with
`../../app.js` using esbuild, compiles the bundle to `out/app.c` with porffor, and
builds `out/component.wasm` from that.

[wasi-sdk]: https://github.com/WebAssembly/wasi-sdk
[wasm-tools]: https://github.com/bytecodealliance/wasm-tools
