#!/bin/sh
# Builds out/component.wasm, a wasip2 component, from ../../app.js and
# ../../wit/. Runs build-hermes.sh first if Hermes isn't built yet.
set -e
cd "$(dirname "$0")"
: "${WASI_SDK_PATH:?set WASI_SDK_PATH to a wasi-sdk with wasm exceptions}"
HERMES_BUILD=out/hermes
HERMES=$HERMES_BUILD/src
CC="$WASI_SDK_PATH/bin/clang --target=wasm32-wasip2 -O3 -DNDEBUG"
# setjmp/longjmp and C++ exceptions both use wasm exceptions
EH="-mllvm -wasm-enable-sjlj -mllvm -wasm-use-legacy-eh=false"

if [ ! -f "$HERMES_BUILD/build-wasm/lib/libhermesvm_a.a" ]; then
  ./build-hermes.sh
fi

cargo run -q -- ../../wit --source ../../app.js --out-dir out
npx -y esbuild@0.28.2 out/main.js --bundle --format=iife --platform=neutral \
  --outfile=out/bundle.js --log-level=warning $(cat out/esbuild-aliases.txt)
"$HERMES_BUILD/build-host/bin/shermes" -emit-c -exported-unit=app -o out/app.c out/bundle.js

# NDEBUG must match the VM's, which is a release build
$CC $EH -fno-strict-aliasing -fno-strict-overflow \
  -I"$HERMES_BUILD/build-wasm/lib/config" -I"$HERMES/include" -c out/app.c -o out/app.o
for f in src/embedding.cpp out/bindings.cpp; do
  $CC $EH -x c++ -std=c++17 -fwasm-exceptions -Isrc -I"$HERMES/API" -I"$HERMES/API/jsi" \
    -I"$HERMES/include" -I"$HERMES/public" -I"$HERMES_BUILD/build-wasm/lib/config" \
    -c "$f" -o "out/$(basename "$f" .cpp).o"
done
$CC -fwasm-exceptions -mexec-model=reactor out/app.o out/embedding.o out/bindings.o \
  -L"$HERMES_BUILD/build-wasm/lib" -L"$HERMES_BUILD/build-wasm/jsi" -lhermesvm_a -ljsi \
  -lc++ -lc++abi -lunwind -lsetjmp -lwasi-emulated-mman -lwasi-emulated-signal \
  -lwasi-emulated-process-clocks -lwasi-emulated-getpid \
  -Wl,-z,stack-size=1048576 -Wl,--strip-debug -Wl,--component-type=../../wit/world.wit -o out/component.wasm
