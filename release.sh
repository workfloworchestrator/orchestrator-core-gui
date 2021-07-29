#!/bin/bash
rm -rf .gitlab
rm -rf charts
rm -rf node_modules
rm .env
rm .env.local.example
rm .gitlab-ci.yml
cp README_GPL.md README.md
rm Dockerfile
rm -rf .git
git init
rm release.sh
git add .
git commit -am "Initial commit"
git branch -M main
git remote add origin git@github.com:workfloworchestrator/orchestrator-client.git
git push -u origin main
