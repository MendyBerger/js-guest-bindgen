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
sizes=""
for name in $EMBEDDINGS; do
  dir=embeddings/$name
  echo "== $name"
  if "$dir/build.sh"; then
    bytes=$(wc -c < "$dir/out/component.wasm")
    size=$(awk -v n="$name" -v b="$bytes" 'BEGIN { printf "%-16s %6.2f MB (%d bytes)", n, b / 1048576, b }')
    echo "$size"
    sizes="$sizes$size\n"
    "$RUNNER" "$dir/out/component.wasm" || failed="$failed $name"
  else
    failed="$failed $name"
  fi
done

echo "== component sizes"
printf "$sizes"
if [ -n "$failed" ]; then
  echo "failed:$failed"
  exit 1
fi
echo "all embeddings passed"
