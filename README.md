You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

# Workflows

This project contains the workflow GUI SURFnet Network Automation. 

## Client

The client is a ReactJS user interface. This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

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

To add new dependencies:

```
yarn add package --dev
```

### Docker
Deploys of GUI Workflows are in the form of a Docker image with nginx.
