# js-guest-bindgen

Generates bindings for JavaScript that runs *inside* a WebAssembly component,
on a JS engine embedded in the guest. It is built on
[jco](https://github.com/bytecodealliance/jco)'s `js-component-bindgen`, and
adapted from
[ComponentizeJS](https://github.com/bytecodealliance/ComponentizeJS)'s
`spidermonkey-embedding-splicer` bindgen.

For a WIT world, [`guest_bindgen`](./src/lib.rs)
returns:

- JS that lifts and lowers every import and export, handles resources, and
  checks the user's module exports what the world requires
- the core function signatures the embedding has to provide or call

The embedding supplies the core exports and imports, memory access and any
intrinsics it overrides. See the crate docs for the full contract.

## Layout

- [`src`](./src): the generator. Its
  [snapshot tests](./tests/snapshots) show the JS it produces for a few worlds.
- [`vendor/js-component-bindgen`](./vendor/js-component-bindgen): the vendored
  fork it is built on (see below).
- [`examples`](./examples): one component written in JS
  ([`app.js`](./examples/app.js), [`wit`](./examples/wit)), built three ways:
  - [`embeddings/boa`](./examples/embeddings/boa) runs it on the
    [Boa](https://boajs.dev) engine.
  - [`embeddings/porffor`](./examples/embeddings/porffor) compiles it ahead of time
    with [Porffor](https://porffor.dev).
  - [`embeddings/static-hermes`](./examples/embeddings/static-hermes)
    compiles it ahead of time with
    [Static Hermes](https://github.com/facebook/hermes) and runs it on the
    Hermes VM.
  - [`test-runner`](./examples/test-runner) is a wasmtime embedding that
    tests each build: it provides the `logger` resource and calls every
    export.
  - [`run-all.sh`](./examples/run-all.sh) builds every embedding and runs it
    with the test runner.

## Vendored js-component-bindgen

[`vendor/js-component-bindgen`](./vendor/js-component-bindgen) is a copy of
`js-component-bindgen` 2.16.0 from crates.io with the guest memory hooks added
(the `memoryView` and `memoryWrite` intrinsics, and `dataView` for list
lowering), since they are not in a release. Every change to the original is
marked with a `FORK(js-guest-bindgen)` comment:

```sh
grep -rn "FORK(js-guest-bindgen)" vendor/js-component-bindgen
```

It is `publish = false`, so js-guest-bindgen cannot be published to crates.io
until the hooks are released or the fork is published under its own name.

## Tests

```sh
cargo test
# also run the vendored fork's tests:
cargo test --workspace
# after an intended change to the generated JS:
BLESS=1 cargo test --test snapshots
```
