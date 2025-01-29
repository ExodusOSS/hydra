#!/usr/bin/env bash

DIR="$(dirname "${BASH_SOURCE[0]}")"

node "$DIR/api-types/index.js" "$DIR/../src/ui/exodus.ts"
node "$DIR/feature-metadata/index.js" "$DIR/../../../features"
