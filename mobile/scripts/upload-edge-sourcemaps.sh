#!/bin/bash

# Script to upload Supabase Edge Function sourcemaps to Rollbar
# Usage: ./scripts/upload-edge-sourcemaps.sh <project_ref> <function_name> <commit_sha>

PROJECT_REF=$1
FUNCTION_NAME=$2
REVISION=$3

if [ -z "$PROJECT_REF" ] || [ -z "$FUNCTION_NAME" ] || [ -z "$REVISION" ]; then
    echo "Usage: $0 <project_ref> <function-name> <revision>"
    exit 1
fi

if [ -z "$ROLLBAR_POST_SERVER_ITEM_TOKEN" ]; then
    echo "Error: ROLLBAR_POST_SERVER_ITEM_TOKEN is not set"
    exit 1
fi

echo "Uploading sourcemaps for $FUNCTION_NAME (Revision: $REVISION)..."
echo "Rollbar Project Token: ${ROLLBAR_POST_SERVER_ITEM_TOKEN:0:4}...${ROLLBAR_POST_SERVER_ITEM_TOKEN: -4}"
echo "Minified URL: https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"
MINIFIED_URL="https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"

# Perform upload using Rollbar CLI
# Scans the dist directory for index.js and index.js.map
npx rollbar-cli upload-sourcemaps \
    "./supabase/functions/dist/$FUNCTION_NAME" \
    --access-token "$ROLLBAR_POST_SERVER_ITEM_TOKEN" \
    --code-version "$REVISION" \
    --url-prefix "$MINIFIED_URL/" \
    --verbose

echo "Upload complete for $FUNCTION_NAME"
