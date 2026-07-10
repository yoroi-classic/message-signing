#!/bin/bash

set -euo pipefail

if ! command -v nvm >/dev/null 2>&1; then
    export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
    if [ -s "$NVM_DIR/nvm.sh" ]; then
        # shellcheck disable=SC1090
        . "$NVM_DIR/nvm.sh"
    else
        echo "Error: nvm is required. Install nvm or set NVM_DIR to an existing nvm installation." >&2
        exit 1
    fi
fi

nvm install
corepack enable
corepack prepare npm@10.9.7 --activate
npm ci
npm run setup:wasm-pack
npm run verify
