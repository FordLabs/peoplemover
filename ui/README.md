## Building

### Getting Started
This is the web UI for PeopleMover. To find out more about the back-end server, visit the [PeopleMover Server](https://github.com/FordLabs/PeopleMover) repository.

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

## Auth
PeopleMover can be used without any form of Auth. However, to take advantage of features such as unique users, you'll
need to provide an auth client.

### AuthQuest
In production, PeopleMover uses a proprietary auth client called AuthQuest. To use AuthQuest, you'll need to:
1. create a client_id for your instance of PeopleMover on AuthQuest
2. fill in the following values in `./.env.local`:
```
REACT_APP_AUTHQUEST_URL=https://authquest-url.com
REACT_APP_AUTHQUEST_CLIENT_ID=AQ-client-id
```
3. run `npm run start` to start PeopleMoverUI with auth enabled

### Alternative Auth Clients
To use an alternative auth client, you will still need to provide those two properties above.
See the [PeopleMover Server](https://github.com/FordLabs/PeopleMover) repository for more information connecting your auth client.

## License

PeopleMover is licensed under the Apache 2.0 license.
