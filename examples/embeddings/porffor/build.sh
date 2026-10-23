#!/bin/sh
# Builds out/component.wasm, a wasip3 component, from ../../app.js and ../../wit/.
# Downloads the pinned porffor to out/porffor and applies porffor/wasi.patch.
set -e
cd "$(dirname "$0")"
: "${WASI_SDK_PATH:?set WASI_SDK_PATH to a wasi-sdk with wasm32-wasip3}"
. ../../tools.sh
# the commit porffor/wasi.patch is made against
PORFFOR_COMMIT=0c135ce2f36fdd3467d5a58daa92283810705a51

if [ ! -f out/porffor/runtime/index.js ]; then
  mkdir -p out/porffor
  curl -fsSL "https://github.com/CanadaHonk/porffor/archive/$PORFFOR_COMMIT.tar.gz" |
    tar -xz -C out/porffor --strip-components=1
  patch -d out/porffor -p1 < porffor/wasi.patch
fi

cargo run -q -- ../../wit --source ../../app.js --out-dir out
npx -y esbuild@0.28.2 out/main.js --bundle --format=esm --platform=neutral \
  --outfile=out/bundle.js --log-level=warning $(cat out/esbuild-aliases.txt)
node out/porffor/runtime/index.js c --module out/bundle.js -o out/app.c
"$WASI_SDK_PATH/bin/clang" --target=wasm32-wasip3 -mexec-model=reactor -O2 \
  -D_WASI_EMULATED_SIGNAL -D_WASI_EMULATED_MMAN \
  -mllvm -wasm-enable-sjlj -mllvm -wasm-use-legacy-eh=false \
  out/app.c -lsetjmp -lwasi-emulated-signal -lwasi-emulated-mman \
  -Wl,--skip-wit-component -o out/core.wasm
$WASM_TOOLS component embed ../../wit --world app out/core.wasm -o out/core.wasm
$WASM_TOOLS component new out/core.wasm -o out/component.wasm
