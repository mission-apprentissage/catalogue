#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utils.sh"
MONGO_URL=$(get_stage_mongo_url)

backup_mongodb "${MONGO_URL}"
restore_mongodb
