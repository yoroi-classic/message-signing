#!/bin/bash

# Script to build WASM package artifacts
# Usage: ./wasm-build.sh <target> [--gc]
# Example: ./wasm-build.sh nodejs
# Example: ./wasm-build.sh browser --gc

set -euo pipefail

WASM_PACK_VERSION="0.15.0"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RUST_DIR="$PROJECT_ROOT/rust"

# Parse arguments
TARGET=""
GC_FLAG=""

for arg in "$@"; do
    case $arg in
        --gc)
            GC_FLAG="1"
            ;;
        *)
            TARGET="$arg"
            ;;
    esac
done

if [ -z "$TARGET" ]; then
    echo "Usage: $0 <target> [--gc]"
    echo "  target: nodejs, browser, web"
    echo "  --gc: enable weak references (WASM_BINDGEN_WEAKREF=1)"
    exit 1
fi

# Check if the Rust crate exists
if [ ! -f "$RUST_DIR/Cargo.toml" ]; then
    echo "Error: $RUST_DIR/Cargo.toml not found"
    exit 1
fi

# Build
cd "$RUST_DIR"

if ! command -v wasm-pack >/dev/null 2>&1; then
    echo "Error: wasm-pack $WASM_PACK_VERSION is required. Run npm run setup:wasm-pack."
    exit 1
fi

INSTALLED_WASM_PACK_VERSION="$(wasm-pack --version | awk '{print $2}')"
if [ "$INSTALLED_WASM_PACK_VERSION" != "$WASM_PACK_VERSION" ]; then
    echo "Error: wasm-pack $WASM_PACK_VERSION is required, found $INSTALLED_WASM_PACK_VERSION."
    exit 1
fi

if [ -n "$GC_FLAG" ]; then
    echo "Building with WASM_BINDGEN_WEAKREF=1 --target=$TARGET..."
    WASM_BINDGEN_WEAKREF=1 wasm-pack build --target="$TARGET"
else
    echo "Building with --target=$TARGET..."
    wasm-pack build --target="$TARGET"
fi

echo "Packing..."
wasm-pack pack

echo "Build completed successfully!"
