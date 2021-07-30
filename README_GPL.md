You can find the most recent version of this guide [here](https://git.ia.surfsara.nl/netdev/automation/projects/orchestrator-client/-/blob/dev/README.md).

# Orchestrator Client

This project contains the workflow GUI SURFnet Network Automation.

The client is a ReactJS user interface. This project was bootstrapped with
[Create React App](https://github.com/facebookincubator/create-react-app).

When you need to work on the theming it's good to know that the theme is split into a separate
package: located in `lib/themes/surfnet_light`. It has its own README.

### Pre install

The first time you clone this package you have to run:
```sh
./bootstrap
```
It will symlink the `custom-example` folder to `custom` so the app can find the plugin manifest file.

If you have access to the SURF repositories and cloned it to `../orchestrator-client-surf` you can switch
to the SURF specific variant with all the SURF goodies by running:

```sh
./bootstrap surf
```

If you need to run the test locally you can switch to a temporary workaround mode. It will copy the SURF specific
files to `custom` so `jest` won't have any problems with the symlinks.

```sh
./bootstrap test
```

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
