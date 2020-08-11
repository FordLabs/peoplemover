# Cypress E2E & Integration Testing

1. Overview
2. Running Tests
    - Cypress UI
    - Headless
3. Resources

---

Tests can either be ran via the Cypress Interface, or headless with test results output into the terminal.

The Cypress tests will be ran against the web application which is expected on port `3000`, and the API which is expected on port `8080`. 

Ensure an instance of the API is running locally using the local profile.

Make sure auth is disabled

## Running Tests

**Cypress UI**

Run one of the following commands to open the Cypress interface and start your tests from there:

```bash
# If you already have an APP instance running locally
npm run cy:open
```

```bash
# If you DO NOT already have an APP instance running locally and want an instance stood up and tore down along side the Cypress UI
npm run test:e2e

```

**Headless**

Run one of the following commands to run all of the E2E tests headless and have the results output in the terminal:

```bash
# If you already have an APP instance running locally
npm run cy:run
```

```bash
# If you DO NOT already have an APP instance running locally and want an instance stood up and tore down
npm run test:e2e:ci

```

## Additional Resources:

* [Cypress.io](https://www.cypress.io/)
* [Gatsby E2E testing documentation](https://www.gatsbyjs.org/docs/end-to-end-testing/)
