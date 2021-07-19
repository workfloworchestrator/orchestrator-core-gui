#!/bin/bash
cd src || exit
if [ "$1" = "surf" ]; then
    echo "Switching to linked mode; loading SURF specific modules"
    rm custom
    ln -s ../../orchestrator-client-surf/src custom
elif [ "$1" = "test" ]; then
    echo "Switching to test mode; with SURF specific modules"
    echo "This is a temporary workaround as jest has problems with symlinks and the tests aren't splitted yet"
    rm -rf custom
    cp -r ../../orchestrator-client-surf/src custom
else
    echo "Removing surfnet specific components and reverting back to standalone mode"
    rm custom
    ln -s custom-example custom
fi
