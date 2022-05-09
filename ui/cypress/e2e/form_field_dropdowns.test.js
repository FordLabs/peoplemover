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

/// <reference types="Cypress" />

const expectedCreateOptionText = (expectedCreationString) => `Create "${expectedCreationString}"`;

describe('Form Dropdown Fields', () => {

    beforeEach(() => {
        cy.server();
        cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');
        cy.route('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postNewProductTag');

        cy.visitSpace({locationData: [], productTagsData: []});
        cy.get('[data-testid=newProductButton]').click();

        cy.getModal()
            .should('contain', 'Add New Product');
        cy.get('[data-testid=productForm]').as('productForm');
    });

    it('Add Location Workflow', () => {
        const focusOnLocationDropdownInput = () => {
            cy.get('@productLocationInput')
                .click({force: true});
        };
        const locationDropdownMenuIsClosed = () => {
            cy.get('@productForm')
                .find('.location__option')
                .should('not.exist');
        };
        const typeIntoLocationInput = (text) => {
            cy.get('@productLocationInput')
                .type(text, { force: true });
        };

        const newLocation1 = 'Chilton';
        const newLocation2 = 'Stars Hollow';

        cy.get('@productForm')
            .find('[id=location]')
            .as('productLocationInput');

        focusOnLocationDropdownInput();

        locationDropdownMenuIsClosed();

        typeIntoLocationInput(newLocation1);

        cy.get('@productForm')
            .find('.location__option')
            .should('have.length', 1)
            .should('contain', expectedCreateOptionText(newLocation1));

        typeIntoLocationInput('{enter}');

        cy.wait('@postNewLocation');

        locationDropdownMenuIsClosed();

        cy.get('@productForm')
            .should('contain', newLocation1);

        focusOnLocationDropdownInput();

        locationDropdownMenuIsClosed();

        typeIntoLocationInput(newLocation1.slice(0, newLocation1.length - 1));

        cy.get('@productForm')
            .find('.location__option')
            .should('have.length', 1)
            .should('contain', expectedCreateOptionText('Chilto'));

        typeIntoLocationInput('n');

        locationDropdownMenuIsClosed();

        cy.get('.location__clear-indicator').click();

        focusOnLocationDropdownInput();

        cy.get('@productForm')
            .find('.location__option')
            .should('have.length', 1)
            .should('contain', newLocation1);

        cy.get('@productLocationInput')
            .clear();

        typeIntoLocationInput(newLocation2);

        cy.get('@productForm')
            .find('.location__option')
            .should('have.length', 1)
            .should('contain', expectedCreateOptionText(newLocation2));
    });

    it('Add Product Tags Workflow', () => {
        const focusOnProductTagsDropdownInput = () => {
            cy.get('@productTagsInput')
                .click({force: true});
        };
        const productTagsDropdownMenuIsClosed = () => {
            cy.get('@productForm')
                .find('.productTags__option')
                .should('not.exist');
        };
        const typeIntoProductTagsInput = (text) => {
            cy.get('@productTagsInput')
                .type(text, { force: true });
        };

        const newProductTag1 = 'Chilton';
        const newProductTag2 = 'Stars Hollow';

        cy.get('@productForm')
            .find('[id=productTags]')
            .as('productTagsInput');

        focusOnProductTagsDropdownInput();

        productTagsDropdownMenuIsClosed();

        typeIntoProductTagsInput(newProductTag1);

        cy.get('@productForm')
            .find('.productTags__option')
            .should('have.length', 1)
            .should('contain', expectedCreateOptionText(newProductTag1));

        typeIntoProductTagsInput('{enter}');

        cy.wait('@postNewProductTag');

        productTagsDropdownMenuIsClosed();

        cy.get('@productForm')
            .should('contain', newProductTag1);

        focusOnProductTagsDropdownInput();

        productTagsDropdownMenuIsClosed();

        focusOnProductTagsDropdownInput();

        cy.get('@productForm')
            .find('.productTags__option')
            .should('have.length', 0);

        typeIntoProductTagsInput(newProductTag2);

        cy.get('@productForm')
            .find('.productTags__option')
            .should('have.length', 1)
            .should('contain', expectedCreateOptionText(newProductTag2));

        typeIntoProductTagsInput('{enter}');

        cy.wait('@postNewProductTag');

        cy.get('.productTags__multi-value__remove').eq(0).click();
        cy.get('.productTags__multi-value__remove').eq(0).click();

        focusOnProductTagsDropdownInput();

        cy.get('@productForm')
            .find('.productTags__option')
            .should('have.length', 2);
    });
});
