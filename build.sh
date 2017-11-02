#!/bin/bash
./clean.sh
CI=true yarn install && yarn test && yarn build
