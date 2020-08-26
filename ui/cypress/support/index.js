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

import './commands';
const spaceUuid = Cypress.env('SPACE_UUID');

beforeEach(() => {
    cy.log('Reset DB');
    cy.resetSpace(spaceUuid);
    cy.viewport(1000, 660);
});