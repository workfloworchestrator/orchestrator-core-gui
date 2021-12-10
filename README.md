You can find the most recent version of this guide [here](https://git.ia.surfsara.nl/netdev/automation/projects/orchestrator-client/-/blob/dev/README.md).

# Orchestrator Client

This project contains the workflow GUI SURFnet Network Automation.

The client is a ReactJS user interface. This project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

When you need to work on the theming it's good to know that the theme is split into a separate
package: located in `lib/themes`. It has its own README.

### Installing

Depending on the OS there are ways to install yarn with a package manager.

Note: If you need more flexibility, like having the ability to test with multiple Node JS versions, we strongly recommend
to use NVM. More info [here](https://github.com/nvm-sh/nvm#installing-and-updating). You would then install yarn also
from within your Node env.

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

#### Linux

This project currently only works with Node.js 14 (if you also want to be able to run the tests in a deterministic way).

```sh
npm install yarn -g
npm install npm-run-all --save-dev -g
./build.sh
```

### Running locally

To run locally:

```sh
./bootstrap.sh # only needed the first time if you don't use plugins
yarn start
```

Browse to the [application homepage](http://localhost:3000/).

#### Running against dev backend

Copy `.env.local.example` to `.env.local`

This overrides the `REACT_APP_BACKEND_URL` variable. You should make local changes to `.env.local`

There is also a .env file checked in that points to a backend that runs locally (https://localhost:8080).

### Add new dependencies

```sh
yarn add 'package-name'
```

### Docker

Deploys of GUI Workflows are in the form of a Docker image with nginx.

### Packages

We are using Prettier as a code formatter. You can run prettier like this:

```shell
    # Only check formatting
    yarn prettier
    # Apply prettier rules to project
    yarn prettier-fix
```

Similarly, you can run other yarn (sub)commands that can be found in the `package.json`

### Running the tests

To run the unit-tests, do: `yarn test`.

If this fails, you might want to increase your inotify limit. For more information, see
https://unix.stackexchange.com/questions/13751/kernel-inotify-watch-limit-reached

Tests consist out of snapshots tests for storybook items and tests for the uniforms based form inputs

WebStorm can run the tests from the IDE by default and is the easiest to start with, especially when you want to
easily run separate tests.

The uniforms component are covered by React component tests with [Enzyme](https://enzymejs.github.io/enzyme/).
It contains a lot of tests and additionally uses snapshots in JSON format to check on the rendering as a whole
and to assert more specific stuff like the existence of an expected div with className="x".

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


## Actions and page views depending on who you are.
The orchestrator client can be configured to allow access to a page or to buttons in the client. The react app
consumes a webassembly OPA policy and evaluates if the user has the correct claims to view certain resources.
The function that gets called is the ```allowed()``` function in `src/utils/policy.ts`. The implementation of `allowed()`
is done as follows:

```typescript jsx
{allowed("/orchestrator/arbitrary/resource/name") && (
    <EuiFlexItem>
        ...
    </EuiFlexItem>
)}
```

Basically it boils down to: when a call to `allowed` returns true the component will be shown.

**When no policy is found, the orchestrator-client will allow access to the resource.
Any real access must be enforced by the API. The client only disables features with the `allowed` function**


### Pages

These are the pages in the orchestrator client and how the resources can be viewed. In the implementation we only disable
menu items, not the actual pages. If a user has a direct url they will still be able to access the resource.

|Page|Resource name|
|---|---|
|Processes Pages|`/orchestrator/processes/`|
|Subscriptions Pages|`/orchestrator/subscriptions/`|
|Metadata Pages|`/orchestrator/metadata/`|
|Tasks Pages|`/orchestrator/tasks/`|
|Settings Pages|`/orchestrator/settings/`|

If you would like to add an extra menu item you are free to name it as you wish. It is defined in the `allowed` function.

### Actions
Actions are disabled in the same manner as menu items. The following actions are configurable:

|Action|Location|Resource name| Explanation|
|---|---|---|---|
|Modify a subscription|Subscription detail page action menu|`/orchestrator/subscriptions/modify/*`|This resource can be configured per workflow|
|Terminate a subscription| "    "|`/orchestrator/subscriptions/terminate/*`|With this resource you can terminate a subscription|
|Validate a subscription|"   "|`/orchestrator/subscriptions/validate/*`|With this resource you can validate a certain subscription|
|View a subscription from the process detail page|The process detail page|`/orchestrator/subscriptions/view/from-process`|Interact with a subscription from the process detail page|
|Abort a process|" " |`/orchestrator/processes/abort/*`| The ability to abort a process|
|Delete a process|" "|`/orchestrator/processes/delete/*`| The ability to delete a process, this is always disabled for processes not for tasks|
|Retry a process|" "|`/orchestrator/processes/retry/*`| The ability to retry a failed process or task|
|View a subscription from a process|" "|`/orchestrator/subscriptons/view/from-process` |This enables the link towards the subscription detail page|
|View a process detail page| The process list page| `/orchestrator/processes/details/*`| The allows the person to visit a process detail page|
|Retry all tasks| The tasks list page|`/orchestrator/processes/all-tasks/retry`| The Retry all tasks button|
|Create a task| The tasks list page|`/orchestrator/processes/create/task`| Create a task|
|Create a new subscription|The new process button|`/orhcestrator/processes/create/process/menu`||
|Render a user_input_form|Allow access to input steps| `/orchestrator/processes/user_inout/*`|Allow access to input_steps|
|Allow deletion of product blocks| Product block detail page|`/orchestrator/metadata/product-block/delete/*`||
|Edit a product block| "  "|`/orchestrator/metadata/product-block/edit/*`||
|View a product block|Product block list page|`/orchestrator/metadata/prodcut-block/view/*`||
|View a product|Product list page|`/orchestrator/metadata/product/view/*`||
|Edit a product|Product detail page|`/orchestrator/metadata/product/edit/*`||
|Delete a product|Product detail page|`/orchestrator/metadata/product/delete/*`||

New actions or other actions can be enabled or disabled in the same way as menu items, by adding an arbitrary resource
to the project.
