> **FORK(js-guest-bindgen):** this is a copy of `js-component-bindgen` 2.16.0
> from crates.io, vendored because js-guest-bindgen needs the guest memory hooks
> (the `memoryView` and `memoryWrite` intrinsics, and `dataView` for list
> lowering), which are not in a release. Every change to the original sources is
> marked with a `FORK(js-guest-bindgen)` comment:
> `grep -rn "FORK(js-guest-bindgen)" vendor/js-component-bindgen`.

<h1 align="center">js-component-bindgen</h1>
<div align="center">
  <strong>
      Transpile WebAssembly components into JavaScript
  </strong>
</div>

<br />

<div align="center">
  <!-- Crates version -->
  <a href="https://crates.io/vendor/js-component-bindgen">
    <img src="https://img.shields.io/crates/v/js-component-bindgen.svg?style=flat-square"
    alt="Crates.io version" />
  </a>
  <!-- Downloads -->
  <a href="https://crates.io/vendor/js-component-bindgen">
    <img src="https://img.shields.io/crates/d/js-component-bindgen.svg?style=flat-square"
      alt="Download" />
  </a>
  <!-- docs.rs docs -->
  <a href="https://docs.rs/js-component-bindgen">
    <img src="https://img.shields.io/badge/docs-latest-blue.svg?style=flat-square"
      alt="docs.rs docs" />
  </a>
</div>

## Installation
```sh
$ cargo add js-component-bindgen
```

# License

This project is licensed under the Apache 2.0 license with the LLVM exception.
See [LICENSE](LICENSE) for more details.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this project by you, as defined in the Apache-2.0 license,
shall be licensed as above, without any additional terms or conditions.
