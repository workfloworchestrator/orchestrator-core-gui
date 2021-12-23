#!/bin/bash
set -e
cd src || exit

if [ "$1" = "surf" ]; then
    echo "Switching to SURF mode; loading SURF specific modules"
    echo "You can use './bootstrap.sh' to switch back to standalone mode"
    rm -rf custom
    ln -s custom-example custom
else
  echo "Removing SURF specific components and reverting back to standalone mode"
  rm -rf custom
  ln -s custom-example custom
fi
