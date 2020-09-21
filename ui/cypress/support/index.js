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

const API_PRODUCTS_PATH = `/api/spaces/${spaceUuid}/products`;
const API_PERSON_PATH = `/api/person/${spaceUuid}`;
const API_ROLE_PATH = `/api/role/${spaceUuid}`;
const API_PRODUCT_TAG_PATH = `/api/producttag/${spaceUuid}`;
const API_LOCATION_PATH = `/api/location/${spaceUuid}`;
const API_ASSIGNMENT_PATH = `/api/assignment`;

before(() => {
    Cypress.env('API_PRODUCTS_PATH', API_PRODUCTS_PATH);
    Cypress.env('API_PERSON_PATH', API_PERSON_PATH);
    Cypress.env('API_ROLE_PATH', API_ROLE_PATH);
    Cypress.env('API_PRODUCT_TAG_PATH', API_PRODUCT_TAG_PATH);
    Cypress.env('API_LOCATION_PATH', API_LOCATION_PATH);
    Cypress.env('API_ASSIGNMENT_PATH', API_ASSIGNMENT_PATH);
});

beforeEach(() => {
    cy.log('Reset DB');
    cy.resetSpace(spaceUuid);
    cy.viewport(1000, 660);
});
