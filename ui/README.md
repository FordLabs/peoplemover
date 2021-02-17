# PeopleMover UI
This is the web UI for PeopleMover.

## Building

### Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Dependencies
- [Node 14](https://nodejs.org)

### Build with NPM
1. Run `npm install` to install the dependencies
2. Build the project with the following command: `npm run build`

## Testing

### Unit Tests
```
npm run test
```

### End-To-End Tests
Our end-to-end testing framework is [Cypress](https://www.cypress.io/).

Running the following command will also attempt to run the backend; terminate any running instances before running these tests.

```
npm run test:e2e
```

## Running
Before starting the frontend make sure the [backend](../api/Readme.md) is running.
Start the frontend for live development:
```
npm run start
```
This will connect the frontend with to the server at localhost:8080/api.
The ui application will start at localhost:3000.

Note: If you are running the backend with simplified authentication, your ability to access the frontend will be limited.
If this is the case, you should be able to navigate to the [home page](http://localhost:3000) and the 
[test space](http://localhost:3000/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)


## Set up Analytics
We support matomo out of the box. You will need to replace matomo-url-placeholder 
and matomo-site-id-placeholder in the `analytics-template.js` file, and copy its contents
to the `analytics.js` file.

You can also add google analytics, hotjar and more by adding the config scripts
in the `analytics.js` file

## License

PeopleMover is licensed under the Apache 2.0 license.
