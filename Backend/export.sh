#!/bin/bash

echo "==============EXPORT DATABASE=============="
sleep 1s

# Read .env
source ./.env

# MongoDB Atlas URI
CONNECTION_STRING="mongodb+srv://$ATLAS_USERNAME:$ATLAS_PASSWORD@$ATLAS_CLUSTER/$ATLAS_DATABASE"

DB_COLLECTIONS=$(mongosh "$CONNECTION_STRING" --quiet --eval "db.getCollectionNames().join(' ')")

for collection in $DB_COLLECTIONS; do
    echo "Exporting $ATLAS_DATABASE/$collection ..."
    mongoexport --uri="$CONNECTION_STRING" --collection=$collection --out=./database/$collection.json
done

echo "->>> Done"
