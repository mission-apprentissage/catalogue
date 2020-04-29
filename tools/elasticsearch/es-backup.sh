#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utils.sh"
ES_URL="$(get_stage_elasticsearch_url)"

function main() {
    backup_elasticsearch_index "${ES_URL}" "etablissements"
    backup_elasticsearch_index "${ES_URL}" "formations"
    archive_backup
}

main "$@"


