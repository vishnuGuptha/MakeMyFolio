#!/bin/bash
# Build TypeScript → dist/ before the app process starts.
set -euo pipefail
cd /var/app/staging
npm run build
