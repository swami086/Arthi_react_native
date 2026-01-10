#!/bin/bash

# Configuration
ROLLBAR_POST_SERVER_ITEM_TOKEN=$ROLLBAR_POST_SERVER_ITEM_TOKEN
ENVIRONMENT=${1:-production}
REVISION=${2:-$GIT_SHA}
USERNAME=${3:-$GITHUB_ACTOR}

if [ -z "$ROLLBAR_POST_SERVER_ITEM_TOKEN" ]; then
  echo "Error: ROLLBAR_POST_SERVER_ITEM_TOKEN is not set"
  exit 1
fi

if [ -z "$REVISION" ]; then
  echo "Error: Revision (GIT_SHA) is not set"
  exit 1
fi

echo "Notifying Rollbar of deploy: $ENVIRONMENT - $REVISION"

curl https://api.rollbar.com/api/1/deploy/ \
  -F access_token=$ROLLBAR_POST_SERVER_ITEM_TOKEN \
  -F environment=$ENVIRONMENT \
  -F revision=$REVISION \
  -F local_username=$USERNAME \
  -F comment="Deploy from CI/CD"

echo -e "\nDone."
