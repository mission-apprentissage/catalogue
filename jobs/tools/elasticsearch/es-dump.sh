#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/utils.sh"
ES_URL="$(get_stage_elasticsearch_url)"

function main() {
    local elasticsearch_url="http://localhost:9200"
    local kibana_url="http://localhost:5601"

    dump_elasticsearch_index "${ES_URL}" "${elasticsearch_url}" "etablissements"
    create_kibana_index_pattern "${kibana_url}" "etablissements"

    dump_elasticsearch_index "${ES_URL}" "${elasticsearch_url}" "formations"
    create_kibana_index_pattern "${kibana_url}" "formations"

    set_kibana_default_index "${kibana_url}" "etablissements"
}

main "$@"
