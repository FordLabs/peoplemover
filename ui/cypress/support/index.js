// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
import product from '../fixtures/product';


import './commands';

beforeEach(() => {
    // now this runs prior to every test
    // across all files no matter what
    const todaysDate = Cypress.moment().format('yyyy-MM-DD');
    cy.resetBoard(product.name, todaysDate);

    cy.goToTestBoard();
})
