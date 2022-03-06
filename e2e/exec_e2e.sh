#!/bin/bash

set -eux

cd ../frontend
yarn dev > /dev/null 2>&1 &
cd -

cd ../backend
yarn dev > /dev/null 2>&1 &
cd -

node exec_e2e.js

