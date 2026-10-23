#!/bin/sh
# Builds every embedding and runs its component with the test runner.
# Pass embedding names to run only those, e.g. `./run-all.sh boa porffor`.
# porffor and static-hermes need WASI_SDK_PATH. The first run downloads and
# builds the pinned tools and engines, which takes a while for Hermes.
cd "$(dirname "$0")"
EMBEDDINGS=${*:-$(ls embeddings)}

cargo build -q --manifest-path test-runner/Cargo.toml || exit 1
RUNNER=$(realpath test-runner/target/debug/test-runner)

failed=""
for name in $EMBEDDINGS; do
  dir=embeddings/$name
  echo "== $name"
  "$dir/build.sh" && "$RUNNER" "$dir/out/component.wasm" || failed="$failed $name"
done

if [ -n "$failed" ]; then
  echo "failed:$failed"
  exit 1
fi
echo "all embeddings passed"
