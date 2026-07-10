#!/bin/bash

set -euo pipefail

WASM_PACK_VERSION="0.15.0"

if command -v wasm-pack >/dev/null 2>&1; then
    INSTALLED_VERSION="$(wasm-pack --version | awk '{print $2}')"
    if [ "$INSTALLED_VERSION" = "$WASM_PACK_VERSION" ]; then
        echo "wasm-pack $WASM_PACK_VERSION is already installed"
        exit 0
    fi
fi

echo "Installing wasm-pack $WASM_PACK_VERSION..."
cargo install wasm-pack --version "$WASM_PACK_VERSION" --locked --force
