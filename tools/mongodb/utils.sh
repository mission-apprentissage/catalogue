function get_stage_mongo_url(){
    if [ "${STAGE}" = "dev" ]
    then
        echo "${MONGODB_URL_DEV}/${MONGODB_DBNAME_DEV}?retryWrites=true&w=majority"
    fi
    if [ "${STAGE}" = "prod" ]
    then
        echo "${MONGODB_URL_PROD}/${MONGODB_DBNAME_PROD}?retryWrites=true&w=majority"
    fi
}

function backup_mongodb() {
    local mongodb_url="${1}"
    local backup_name="mna-mongodb-$(date +'%Y-%m-%d_%H%M%S')"

    docker exec mna_mongodb bash -c "mongodump --verbose --uri '${mongodb_url}' --gzip --out /backups/${backup_name}"
}

function restore_mongodb() {
    local backup_name=$(docker exec mna_mongodb bash -c "ls -t /backups | head -n 1")

    echo "Dropping database.."
    docker exec mna_mongodb bash -c "mongo --eval 'db.dropDatabase();'"

    echo "Restoring database..."
    docker exec mna_mongodb bash -c "mongorestore --drop --gzip  "/backups/${backup_name}""
}
