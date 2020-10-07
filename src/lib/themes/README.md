# SURFnet EUI theme light

## USE

1. `yarn`
2. `yarn build` or `yarn build:watch`

The theme is split into a separate package so the orchestrator-client can use the output of the SASS instead of having
to compile the complete theme on start up. Keep in mind that upgrading EUI should be done in 2 package.json files: the
project one and the package.json in this folder. After updating you run `yarn build` to get a new main CSS file.

When working on the theme itself you can get a hot reloading setup by running the `yarn build:watch` in this folder.
