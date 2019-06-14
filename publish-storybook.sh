#!/bin/bash
rsync -avz --delete storybook-static/ swarm01.dev.automation.surf.net:/opt/swarm-volume/docs/workflows-client/
