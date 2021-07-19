#!/bin/bash
cd src || exit
if [ "$1" = "surf" ]; then
    echo "Switching to linked mode; loading SURF specific modules"
    rm -rf custom
    ln -s ../../orchestrator-client-surf/src custom
else
    echo "Removing surfnet specific components and reverting back to standalone mode"
    rm custom
    ln -s custom-example custom
fi
