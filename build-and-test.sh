#!/bin/bash

set -euo pipefail

./test.sh
npm run rust:build-nodejs
