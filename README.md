You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

# Orchestrator Client

This project contains the workflow GUI SURFnet Network Automation.

It's based on create-react-app 2.3:

Here’s a short summary of what’s new in this release:

🎉 More styling options: you can use Sass and CSS Modules out of the box.
🐠 We updated to Babel 7, including support for the React fragment syntax and many bugfixes.
📦 We updated to webpack 4, which automatically splits JS bundles more intelligently.
🃏 We updated to Jest 23, which includes an interactive mode for reviewing snapshots.
💄 We added PostCSS so you can use new CSS features in old browsers.
💎 You can use Apollo, Relay Modern, MDX, and other third-party Babel Macros transforms.
🌠 You can now import an SVG as a React component, and use it in JSX.
🐈 You can try the experimental Yarn Plug’n’Play mode that removes node_modules.
🕸 You can now plug your own proxy implementation in development to match your backend API.
🚀 You can now use packages written for latest Node versions without breaking the build.
✂️ You can now optionally get a smaller CSS bundle if you only plan to target modern browsers.
👷‍♀️ Service workers are now opt-in and are built using Google’s Workbox.

## Client

The client is a ReactJS user interface. This project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

The client is build with react and to get initially started:

### Installing

#### Mac

Using Brew:

```
brew install yarn
```

or using MacPorts:

```
sudo port install yarn npm5
```

and then:

```
yarn install
```

Note: when you use python3 as a default python on mac you will receive an error when yarn tries to install gyp:
stating that it needs python >2.5 < 3.0: you can then still install stuff by pointing yarn to the default python2.7 on
Mac OS:

`yarn install --python /usr/bin/python2.7`

#### Linux

```
npm install yarn -g
npm install npm-run-all --save-dev -g
./build.sh
```

### Running locally

To run locally:

```
yarn start
```

Browse to the [application homepage](http://localhost:3000/).

#### Running against dev backend

Copy `.env.local.example` to `.env.local`

This overrides the `BACKEND_URL` variable. You should make local changes to `.env.local`

### Add new dependencies

```
yarn add 'package-name'
```

### Docker

Deploys of GUI Workflows are in the form of a Docker image with nginx.

### CRM calling url

```
new-process?product=58695551-e386-437a-a999-41c1296f84b8&organisation=ad93daef-0911-e511-80d0-005056956c1a
```

### Packages

We are using Prettier as a code formatter. You can run prettier like this:

```shell
    yarn prettier -c --write '**/*.{js,jsx,scss,md}'
```

Similarly you can run other packages that can be found in the package.json

To run the unit-tests, do: `yarn test`.

To run the storybook, do: `yarn storybook`.
Your browser should open to http://localhost:9009/?path=/story/welcome--to-storybook.
