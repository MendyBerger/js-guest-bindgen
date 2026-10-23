#!/bin/sh
# Builds out/component.wasm, a wasip2 component, from ../../app.js and ../../wit/.
set -e
cd "$(dirname "$0")"

# the linker makes the component; it needs the world, since nothing here uses wit-bindgen
cargo rustc --release --target wasm32-wasip2 -- \
  -Clink-arg=--component-type="$(realpath ../../wit/world.wit)"
mkdir -p out
cp target/wasm32-wasip2/release/boa.wasm out/component.wasm
