#!/bin/bash

#runs bookmark-ionic and launches in chrome
echo ""
echo "starting ionic...."
BASE_PATH="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $BASE_PATH"/bookmark-ionic/"

ionic serve