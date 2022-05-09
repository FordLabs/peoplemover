/*
 * Copyright (c) 2022 Ford Motor Company
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

// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import moment from 'moment';

const spaceUuid = Cypress.env('SPACE_UUID');

const BASE_API_URL = Cypress.env('BASE_API_URL');

Cypress.Commands.add('visitSpace', ({ locationData, productTagsData } = {}, hash = '') => {
    cy.server();
    const date = moment().format('yyyy-MM-DD');
    cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${date}`).as('getProductsByDate');
    cy.route('GET', Cypress.env('API_ROLE_PATH')).as('getRoles');
    const locationRoute = {
        method: 'GET',
        url: Cypress.env('API_LOCATION_PATH'),
    };
    if (locationData) locationRoute.response = locationData;
    cy.route(locationRoute).as('getLocations');

    const productTagsRoute = {
        method: 'GET',
        url: Cypress.env('API_PRODUCT_TAG_PATH'),
    };
    if (productTagsData) productTagsRoute.response = productTagsData;
    cy.route(productTagsRoute).as('getProductTags');

    cy.visit(`/${spaceUuid}${hash}`);

    const waitForEndpointsToComplete = [
        '@getProductsByDate',
        '@getRoles',
        '@getLocations',
        '@getProductTags',
    ];
    cy.wait(waitForEndpointsToComplete)
        .then(() => {
            cy.get('[data-testid*=productCardContainer__]')
                .should(($productCards) => {
                    expect($productCards).to.have.length.greaterThan(1);
                });
        });
});

Cypress.Commands.add('getModal', () => {
    return cy.get('[data-testid=modalCard]');
});

Cypress.Commands.add('closeModal', () => {
    cy.get('[data-testid=modalCloseButton]').click();
    cy.getModal().should('not.exist');
});

Cypress.Commands.add('selectOptionFromReactSelect', (parentSelector, checkboxTextToSelect) => {
    cy.get(parentSelector)
        .find('[class*="-control"]')
        .click(0, 0, { force: true })
        .get('[class*="-menu"]')
        .find('[class*="-option"]')
        .contains(checkboxTextToSelect)
        .click(0, 0, { force: true });
});


/* API requests */
Cypress.Commands.add('resetSpace', () => {
    const RESET_SPACE_URL = `${BASE_API_URL}/api/reset/${spaceUuid}`;
    cy.request('DELETE', RESET_SPACE_URL);
});
