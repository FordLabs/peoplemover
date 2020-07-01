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
const spaceId = Cypress.env('SPACE_ID');

import './commands';

// before ALL tests
beforeEach(() => {
    cy.resetBoard();

    cy.visit(`/${spaceId}`);

    cy.get('[data-testid=productCardContainer]')
        .should('have.length', 1);
})
