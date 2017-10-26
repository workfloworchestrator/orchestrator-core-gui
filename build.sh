#!/bin/bash
./clean.sh
# yarn install && yarn lint && yarn test && yarn build
CI=true yarn install && yarn test && yarn build
