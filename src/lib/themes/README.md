# SURFnet EUI theme light

NOTE: in version 42.0.0 EUI switches to @emotion and this also has an effect on the sass vars.

Excerpt from the EUI changelog:

**Breaking changes**

-   Added @emotion/react to peerDependencies
-   Amsterdam is now the default theme, deprecated and renamed old theme as "legacy"
-   Re-organized Sass files including where the globals are imported from

So for now the EUI version is stuck on 41.2.3

## USE

1. `yarn`
2. `yarn build` or `yarn build:watch`

The theme is split into a separate package so the orchestrator-client can use the output of the SASS instead of having
to compile the complete theme on start up. Keep in mind that upgrading EUI should be done in 2 package.json files: the
project one and the package.json in this folder. After updating you run `yarn build` to get a new main CSS file.

When working on the theme itself you can get a hot reloading setup by running the `yarn build:watch` in this folder.
