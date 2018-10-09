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

Note: when you use python3 as a default python on mac you will receive an error when yarn tries to install gyp: 
stating that it needs python >2.5 < 3.0: you can then still install stuff by pointing yarn to the default python2.7 on 
Mac OS: 

```yarn install --python /usr/bin/python2.7```

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

### CRM calling url

```
new-process?product=58695551-e386-437a-a999-41c1296f84b8&organisation=ad93daef-0911-e511-80d0-005056956c1a&dienstafname=744fe180-b2aa-e811-810c-0050569555d1
```
