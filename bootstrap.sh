#!/bin/bash
cd src || exit

echo "Removing surfnet specific components and reverting back to standalone mode"
rm -rf custom
ln -s custom-surf custom

