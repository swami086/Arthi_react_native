#!/bin/bash

# Wrapper script to bundle, deploy, and upload sourcemaps for Supabase Edge Functions to Rollbar
# Usage: ./scripts/deploy-function-with-sourcemaps.sh <function_name> <project_ref>

FUNCTION_NAME=$1
PROJECT_REF=$2

if [ -z "$FUNCTION_NAME" ] || [ -z "$PROJECT_REF" ]; then
    echo "Usage: $0 <function-name> <project-ref>"
    exit 1
fi

if [ -z "$ROLLBAR_POST_SERVER_ITEM_TOKEN" ]; then
    echo "Error: ROLLBAR_POST_SERVER_ITEM_TOKEN is not set"
    exit 1
fi

GIT_COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

echo "--- Phase 1: Bundling with Source Maps ---"
# Create a temporary directory for the bundle
mkdir -p ./supabase/functions/dist/$FUNCTION_NAME

# Bundle using Deno
# We bundle to a single file and generate a sourcemap
deno bundle --sourcemap \
    ./supabase/functions/$FUNCTION_NAME/index.ts \
    ./supabase/functions/dist/$FUNCTION_NAME/index.js

echo "--- Phase 2: Deploying to Supabase ---"
supabase functions deploy $FUNCTION_NAME

echo "--- Phase 3: Uploading Sourcemaps to Rollbar ---"
# Use the existing upload script
# We point it to the dist directory where we bundled
SOURCEMAP_PATH="./supabase/functions/dist/$FUNCTION_NAME/index.js.map"
BUNDLE_PATH="./supabase/functions/dist/$FUNCTION_NAME/index.js"

# Export variables for the upload script
export ROLLBAR_POST_SERVER_ITEM_TOKEN=$ROLLBAR_POST_SERVER_ITEM_TOKEN

# Use a relative path from the script location if needed, or absolute
# For simplicity, we'll assume the script is run from project root
./scripts/upload-edge-sourcemaps.sh $PROJECT_REF $FUNCTION_NAME $GIT_COMMIT_SHA

echo "Successfully deployed $FUNCTION_NAME and uploaded sourcemaps to Rollbar."
