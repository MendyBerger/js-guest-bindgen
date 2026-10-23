# Boa guest with js-guest-bindgen

A component implemented in JavaScript ([`app.js`](../../app.js)) that runs on the
[Boa](https://boajs.dev) engine embedded in Rust, using `js-guest-bindgen` to
generate the guest-side bindings for [`wit/world.wit`](../../wit/world.wit).
The world exports a resource (`counter`) and imports one (`logger`).

- [`build.rs`](./build.rs) runs
  [`js-guest-bindgen`](../../..) over the world and
  generates the core exports and imports in Rust. The JS it produces for other
  worlds can be seen in the crate's
  [snapshot tests](../../../tests/snapshots).
- Boa cannot view the component's linear memory as an `ArrayBuffer`, so
  [`src/prelude.js`](./src/prelude.js) replaces the `dataView`,
  `memoryView`, `memoryWrite` and UTF-8 intrinsics with native functions from
  [`src/lib.rs`](./src/lib.rs).

The component targets `wasm32-wasip2`: on `wasm32-wasip3` every export call runs
on a new thread with fresh thread-local storage, which loses Boa's state
between calls.

## Build and run

Requires the `wasm32-wasip2` Rust target.

```sh
./build.sh
cd ../../test-runner && cargo run -- ../embeddings/boa/out/component.wasm
```

