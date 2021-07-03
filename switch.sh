#!/bin/bash
cd src
if [ -L custom ] ; then
    echo "Removing symlink and reverting back to standalone mode"
    rm custom
    cp -r custom-example custom
else
    echo "Switching to linked mode; loading SURF specific modules"
    rm -rf custom
    ln -s ../../orchestrator-client-surf/src custom
fi
