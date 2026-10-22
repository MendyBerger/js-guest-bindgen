#!/bin/sh
# Builds out/component.wasm, a wasip2 component, from app.js and wit/.
set -e
cd "$(dirname "$0")"
WASM_TOOLS=${WASM_TOOLS:-wasm-tools}

# the WIT world is embedded below with wasm-tools, not by the linker
RUSTFLAGS="-Clink-arg=--skip-wit-component" cargo build --release --target wasm32-wasip2
mkdir -p out
$WASM_TOOLS component embed wit --world app target/wasm32-wasip2/release/boa_counter.wasm -o out/core.wasm
$WASM_TOOLS component new out/core.wasm -o out/component.wasm
