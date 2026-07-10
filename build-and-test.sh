#!/bin/bash

build_and_test() (
    set -euo pipefail

    . ./test.sh
    npm run rust:build-nodejs
)

build_and_test "$@"
