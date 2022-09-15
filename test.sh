#!/bin/bash
cd "$(dirname "$0")" || exit
if grep -Fq "\"name\": \"standalone\"" src/custom/manifest.json
then
    yarn test-script -- --testPathIgnorePatterns=src/custom-surf --testPathIgnorePatterns='.*__SURF-snapshots__/.*' --snapshotResolver=./src/jestSnapshotResolver/snapshotResolver.ts
    exit 0
elif grep -Fq "\"name\": \"SURF\"" src/custom/manifest.json
then
    yarn test-script -- --testPathIgnorePatterns=src/custom-example --testPathIgnorePatterns='.*__standalone-snapshots__/.*' --snapshotResolver=./src/jestSnapshotResolver/snapshotResolver.ts
    exit 0
fi

echo "Please add name prop to the manifest.json."
exit 1