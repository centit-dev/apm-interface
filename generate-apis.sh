#!/bin/bash
rm -rf src/api

curl -o response.json 'https://apifox.com/api/v1/projects/4036118/shared-docs/5a4bbc0b-85fe-4632-8753-0d49e725a1eb/export-data' \
  -H 'Content-Type: application/json;charset=UTF-8' \
  -H 'X-Client-Version: 2.2.30' \
  -H 'X-Project-Id: 4036118' \
  --data-raw '{"type":"openapi","id":"5a4bbc0b-85fe-4632-8753-0d49e725a1eb","version":"3.0","excludeExtension":true,"projectId":4036118}' \
  --compressed

docker run --rm \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/response.json \
  -g typescript-axios \
  -o /local/src/api

rm response.json
