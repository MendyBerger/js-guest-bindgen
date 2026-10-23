#!/bin/sh
# Builds shermes for this machine and the Hermes VM for wasm32-wasip2, into
# out/hermes/build-host and out/hermes/build-wasm. Downloads the pinned Hermes
# source to out/hermes/src and applies hermes/wasi.patch.
set -e
cd "$(dirname "$0")"
: "${WASI_SDK_PATH:?set WASI_SDK_PATH to a wasi-sdk with wasm exceptions}"
HERMES_BUILD=$(realpath -m out/hermes)
HERMES=$HERMES_BUILD/src
COMPAT=$(realpath hermes/compat)
# the static_h commit hermes/wasi.patch is made against
HERMES_COMMIT=2b09a7fa82cc6190c0f470aab540846d06d0d0ac

if [ ! -f "$HERMES/CMakeLists.txt" ]; then
  mkdir -p "$HERMES"
  curl -fsSL "https://github.com/facebook/hermes/archive/$HERMES_COMMIT.tar.gz" |
    tar -xz -C "$HERMES" --strip-components=1
  patch -d "$HERMES" -p1 < hermes/wasi.patch
fi

cmake -S "$HERMES" -B "$HERMES_BUILD/build-host" -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build "$HERMES_BUILD/build-host" --target shermes hermesc

# WASI is not a platform Hermes knows, but its POSIX paths mostly fit
FLAGS="-D_WASI_EMULATED_MMAN -D_WASI_EMULATED_SIGNAL -D_WASI_EMULATED_PROCESS_CLOCKS \
  -D_WASI_EMULATED_GETPID -mllvm -wasm-enable-sjlj -mllvm -wasm-use-legacy-eh=false \
  -isystem $COMPAT -include $COMPAT/wasi-compat.h"
cmake -S "$HERMES" -B "$HERMES_BUILD/build-wasm" -G Ninja -DCMAKE_BUILD_TYPE=Release -DUNIX=ON \
  -DCMAKE_TOOLCHAIN_FILE="$WASI_SDK_PATH/share/cmake/wasi-sdk-p2.cmake" \
  -DWASI_SDK_PREFIX="$WASI_SDK_PATH" \
  -DIMPORT_HOST_COMPILERS="$HERMES_BUILD/build-host/ImportHostCompilers.cmake" \
  -DHAVE_SYS_IOCTL_H=0 -DHERMES_UNICODE_LITE=ON -DHERMES_ALLOW_BOOST_CONTEXT=0 \
  -DHERMESVM_ALLOW_CONCURRENT_GC=OFF -DHERMES_ENABLE_DEBUGGER=OFF -DHERMES_ENABLE_INTL=OFF \
  -DCMAKE_C_FLAGS="$FLAGS" -DCMAKE_CXX_FLAGS="$FLAGS -fwasm-exceptions"
cmake --build "$HERMES_BUILD/build-wasm" --target hermesvm_a jsi
