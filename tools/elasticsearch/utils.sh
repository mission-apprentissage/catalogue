readonly BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.."
readonly BACKUP_DIR="${BASE_DIR}/.data/backups/elasticsearch"

function get_stage_elasticsearch_url(){
    if [ "${STAGE}" = "dev" ]
    then
        echo "https://${ES_URL_DEV}"
    fi
    if [ "${STAGE}" = "prod" ]
    then
        echo "https://${ES_URL_PROD}"
    fi
}

function backup_elasticsearch_index() {
    local input="${1}"
    local index_name="${2}"

    mkdir -p "${BACKUP_DIR}" || true
    find "${BACKUP_DIR}" -name "*.json" -exec rm {} \;

    echo "Copying elastic indexes..."
    elasticdump --input="${input}/${index_name}" --output="${BACKUP_DIR}/${index_name}-mapping.json" --type=mapping
    elasticdump --input="${input}/${index_name}" --output="${BACKUP_DIR}/${index_name}-data.json" --type=data
}

function archive_backup() {
    echo "Archiving elastic backup..."
    local output="${BACKUP_DIR}"
    local archive_name="mna-elasticdump-$(date +'%Y-%m-%d_%H%M%S').tar.gz"

    pushd "${output}" >/dev/null
    find . -name "*.json" | tar -zcvf "${archive_name}" --files-from -
    find . -name "*.json" -exec rm {} \;
    popd >/dev/null
}

function dump_elasticsearch_index() {
    local input="${1}"
    local output="${2}"
    local index_name="${3}"

    echo "Removing previous index ${index_name}..."
    curl -X DELETE "${output}/${index_name}"

    echo "Copying elastic indexes to ${output}..."
    elasticdump --input="${input}/${index_name}" --output="${output}/${index_name}" --type=mapping
    elasticdump --input="${input}/${index_name}" --output="${output}/${index_name}" --type=data
}

function create_kibana_index_pattern() {
    local kibana_url="${1}"
    local index_name="${2}"

    echo "Creating index pattern ${index_name}..."
    curl -X POST "${kibana_url}/api/saved_objects/index-pattern/${index_name}" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: anything" \
        -d"{\"attributes\":{\"title\":\"${index_name}\"}}"
}

function set_kibana_default_index() {
    local kibana_url="${1}"
    local index_name="${2}"

    echo "Making ${index_name} the default index"
    curl -XPOST "${kibana_url}/api/kibana/settings/defaultIndex" \
        -H "Content-Type: application/json" \
        -H "kbn-xsrf: anything" \
        -d"{\"value\":\"${index_name}\"}"
}

