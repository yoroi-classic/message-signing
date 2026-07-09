#!/bin/bash

set -euo pipefail

nvm install
npm ci
npm run setup:wasm-pack
npm run verify
