/*
 * Copyright (c) 2020 Ford Motor Company
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

/// <reference types="Cypress" />

describe('Form Dropdown Fields', () => {
    beforeEach(() => {
        cy.server();
        cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');

        cy.visitBoard({ locationData: [] });
        cy.get('[data-testid=newProductButton]').click();

        cy.getModal()
            .should('contain', 'Add New Product');
        cy.get('[data-testid=productForm]').as('productForm');
    });

    it('Add Location Workflow', () => {
        const newLocation1 = 'added location';

        cy.get('@productForm')
            .find('[id=location]')
            .as('productLocationInput');

        focusOnDropdownInput();

        menuIsClosed();

        cy.get('@productLocationInput')
            .type(newLocation1);

        cy.get('@productForm')
            .find('.location__option')
            .should('have.length', 1)
            .should('contain', 'Press Enter to add "added location"');

        cy.get('@productLocationInput')
            .type('{enter}');

        cy.wait('@postNewLocation');

        menuIsClosed();

        cy.get('@productForm')
            .should('contain', newLocation1);

        focusOnDropdownInput();

        menuIsClosed();

        cy.get('@productLocationInput')
            .type(newLocation1);

        menuIsClosed();
    });
});

const menuIsClosed = () => {
    cy.get('@productForm')
        .find('.location__option')
        .should('not.exist');
};

const focusOnDropdownInput = () => {
    cy.get('@productLocationInput')
        .click({force: true});
};
