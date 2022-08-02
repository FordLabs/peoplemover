/*
 * Copyright (c) 2021 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

import 'cypress-axe';
import './commands';

const spaceUuid = Cypress.env('SPACE_UUID');

const API_ROOT = `/api/spaces/${spaceUuid}`;

const API_PRODUCTS_PATH = `${API_ROOT}/products`;
const API_PERSON_PATH = `${API_ROOT}/people`;
const API_ROLE_PATH = `${API_ROOT}/roles`;
const API_PRODUCT_TAG_PATH = `${API_ROOT}/product-tags`;
const API_PERSON_TAG_PATH = `${API_ROOT}/person-tags`;
const API_LOCATION_PATH = `${API_ROOT}/locations`;
const API_ASSIGNMENT_PATH = `/api/assignment`;
const API_USERS_PATH = `${API_ROOT}/users`;

before(() => {
    Cypress.env('API_PRODUCTS_PATH', API_PRODUCTS_PATH);
    Cypress.env('API_PERSON_PATH', API_PERSON_PATH);
    Cypress.env('API_ROLE_PATH', API_ROLE_PATH);
    Cypress.env('API_PRODUCT_TAG_PATH', API_PRODUCT_TAG_PATH);
    Cypress.env('API_PERSON_TAG_PATH', API_PERSON_TAG_PATH);
    Cypress.env('API_LOCATION_PATH', API_LOCATION_PATH);
    Cypress.env('API_ASSIGNMENT_PATH', API_ASSIGNMENT_PATH);
    Cypress.env('API_USERS_PATH', API_USERS_PATH);
});

beforeEach(() => {
    cy.log('Reset DB');
    cy.resetSpace(spaceUuid);
    cy.viewport(1000, 660);

    cy.intercept('GET', '/user/some_urlflags/', {
        statusCode: 200,
        body: {}
    })
});

Cypress.on('window:before:load', (win) => {
    let copyText;

    if (!win.navigator.clipboard) {
        win.navigator.clipboard = {
            __proto__: {},
        };
    }

    win.navigator.clipboard.__proto__.writeText = (text) => (copyText = text);
    win.navigator.clipboard.__proto__.readText = () => copyText;
});