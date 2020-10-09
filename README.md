You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

# Orchestrator Client

This project contains the workflow GUI SURFnet Network Automation.

The client is a ReactJS user interface. This project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

When you need to work on the theming it's good to know that we split the theme into a separate
package: located in `lib/themes/surfnet_light`. It has its own README.

### Installing

#### Mac

Using Brew:

```sh
brew install yarn
```

or using MacPorts:

```sh
sudo port install yarn npm5
```

and then:

```sh
yarn install
```

Note: when you use python3 as a default python on mac you will receive an error when yarn tries to install gyp:
stating that it needs python >2.5 < 3.0: you can then still install stuff by pointing yarn to the default python2.7 on
Mac OS:

`yarn install --python /usr/bin/python2.7`

#### Linux

This project currently only works with Node.js 14 (if you also want to be able to run the tests).

```sh
npm install yarn -g
npm install npm-run-all --save-dev -g
./build.sh
```

### Running locally

To run locally:

```sh
yarn start
```

Browse to the [application homepage](http://localhost:3000/).

#### Running against dev backend

Copy `.env.local.example` to `.env.local`

This overrides the `BACKEND_URL` variable. You should make local changes to `.env.local`

There is also a .env file checked in that points to a backend that runs locally (https://localhost:8080).

### Add new dependencies

```sh
yarn add 'package-name'
```

### Docker

Deploys of GUI Workflows are in the form of a Docker image with nginx.

### CRM calling url

```sh
new-process?product=58695551-e386-437a-a999-41c1296f84b8&organisation=ad93daef-0911-e511-80d0-005056956c1a
```

### Packages

We are using Prettier as a code formatter. You can run prettier like this:

```shell
    # Only check formatting
    yarn prettier
    # Apply prettier rules to project
    yarn prettier-fix
```

Similarly you can run other packages that can be found in the package.json

### Running the tests

To run the unit-tests, do: `yarn test`.

If this fails, you might want to increase your inotify limit. For more information, see
https://unix.stackexchange.com/questions/13751/kernel-inotify-watch-limit-reached

Tests consist out of snapshots tests for storybook items and tests for the uniforms based form inputs

Webstorm can run the tests from the IDE by default and is the easiest to start with, especially when you want to
easily run separate tests.

The uniforms component are covered by React component tests with enzyme. It contains a lot of tests and additionally
uses snapshots in JSON format to check on the rendering as a whole and to assert more specific stuff like the
existence of an expected div with className="x".

#### Tips

**Updating snapshots:** when snapshot failed: inspect the output and update your snapshots when you are 100% sure
that the changes are indeed expected. After the initial run you can press `-u` to update the snapshots.

**_Debug rendered components:_** You can see what a render of a component delivered with:

```javascript
console.log(wrapper.html());
console.log(wrapper.render());
```

### Storybook

To run the storybook, do: `yarn storybook`.
Your browser should open to http://localhost:9009/?path=/story/welcome--to-storybook.
