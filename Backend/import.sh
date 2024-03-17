#!/bin/sh

echo "==============IMPORT DATABASE=============="
sleep 1s

# Read .env
source ./.env

# MongoDB Atlas URI
CONNECTION_STRING="mongodb+srv://$ATLAS_USERNAME:$ATLAS_PASSWORD@$ATLAS_CLUSTER/$ATLAS_DATABASE"

echo $ATLAS_DATABASE

for FILE in ./database/*.json; do
    echo "Importing $FILE...."
    collection=$(basename $FILE .json)
    mongoimport --uri="$CONNECTION_STRING" --collection=$collection --drop --file=$FILE
done

echo "->>> Done"