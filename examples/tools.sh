# Sourced by the embeddings' build scripts, from their own directory. Builds
# the pinned wasm-tools into ../../out/tools on first use.
WASM_TOOLS=$(realpath -m ../../out/tools/bin/wasm-tools)
if [ ! -x "$WASM_TOOLS" ]; then
  cargo install -q --locked wasm-tools --version 1.262.0 --root "$(realpath -m ../../out/tools)"
fi
