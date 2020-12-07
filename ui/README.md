# PeopleMover UI
This is the web UI for PeopleMover.

## Building

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Built with
* [React](https://reactjs.org/)
* [React-Redux](https://react-redux.js.org/)
* [React Testing Library](https://github.com/testing-library/react-testing-library)
* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en/)

### Build with NPM
1. Run `npm install` to install the dependencies
2. Build the project with the following command: `npm run build`

## Running
Start the frontend with auth turned off for live development:
```
npm run start:noauth
```
This will connect the frontend with to the server at localhost:8080/api.
The ui application will start at localhost:3000.

### Tests

```
npm run test
```

## Set up Analytics
We support matomo out of the box. You will need to replace matomo-url-placeholder 
and matomo-site-id-placeholder in the `analytics-template.js` file, and copy its contents
to the `analytics.js` file.

You can also add google analytics, hotjar and more by adding the config scripts
in the `analytics.js` file

## License

PeopleMover is licensed under the Apache 2.0 license.
