# js-guest-bindgen

A tool for bringing your own JavaScript engine to WASI and the component
model with minimal effort. For a WIT world, it generates the JS bindings that
lift and lower every import and export, so an engine only needs a thin
embedding to run JS as a component. It is built almost entirely from existing
code in [jco](https://github.com/bytecodealliance/jco) and
[ComponentizeJS](https://github.com/bytecodealliance/ComponentizeJS).

## Where the code comes from

- [`src/lib.rs`](./src/lib.rs) is ComponentizeJS's
  [`spidermonkey-embedding-splicer` bindgen](https://github.com/bytecodealliance/ComponentizeJS/blob/7df33dd/crates/spidermonkey-embedding-splicer/src/bindgen.rs),
  with the SpiderMonkey-specific parts made into options (about 170 lines
  added and 90 removed, out of about 1,500, many of them doc comments).
- [`vendor/js-component-bindgen`](./vendor/js-component-bindgen) is jco's
  `js-component-bindgen` 2.16.0 from crates.io, with one change: memory is
  read and written through overridable `dataView`, `memoryView` and
  `memoryWrite` helpers instead of directly, since an engine may not be able
  to view linear memory as an `ArrayBuffer` (35 lines added, 7 removed, each
  marked `FORK(js-guest-bindgen)`).

## Embeddings

The same component, [`examples/app.js`](./examples/app.js) implementing
[`examples/wit`](./examples/wit) (an exported and an imported resource), on
three engines:

- [`boa`](./examples/embeddings/boa): [Boa](https://boajs.dev), an
  interpreter written in Rust, embedded in a Rust component.
- [`porffor`](./examples/embeddings/porffor): [Porffor](https://porffor.dev),
  which compiles the JS ahead of time to C.
- [`static-hermes`](./examples/embeddings/static-hermes):
  [Static Hermes](https://github.com/facebook/hermes), which compiles the JS
  ahead of time to C that runs on the Hermes VM.

To build each one and run it with the
[wasmtime test runner](./examples/test-runner):

```sh
WASI_SDK_PATH=path/to/wasi-sdk ./examples/run-all.sh
```

## Limitations

- Synchronous functions only: async functions, streams and futures are not
  supported yet.
- Strings must be UTF-8.
- The example embeddings don't support 64-bit integers, and copy lists and
  strings in and out of linear memory, since none of their engines can view
  it as an `ArrayBuffer`.
- The vendored `js-component-bindgen` is not published, so neither is this
  crate.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together.
