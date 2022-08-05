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
import product from '../../fixtures/product';
import * as moment from 'moment';

const activeDateString = '01/16/2019'
const activeDate = new Date(activeDateString);

describe('Product', () => {
    beforeEach(() => {
        cy.clock(activeDate);
        cy.visitSpace(undefined, '', activeDate);
    });

    it('Create a new product', () => {
        cy.intercept('POST', Cypress.env('API_PRODUCTS_PATH')).as('postNewProduct');
        cy.intercept('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');
        cy.intercept('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postNewTag');

        cy.get(product.name).should('not.exist');

        cy.get('[data-testid=newProductButton]').click();

        cy.getModal().should('contain', 'Add New Product');

        populateProductForm(product, moment(activeDate).format('MM/DD/yyyy'));

        submitProductForm('Add');

        cy.wait('@postNewProduct').then((interception) => {
            expect(interception?.response.statusCode).to.equal(200);
            const body = interception?.response?.body;
            expect(body.name).to.equal(product.name);
            expect(body.archived).to.equal(product.archived);
            expect(body.spaceLocation.name).to.equal(product.location);
            expect(body.startDate).to.equal(product.startDate.format('yyyy-MM-DD'));
            expect(body.endDate).to.equal(product.nextPhaseDate.format('yyyy-MM-DD'));
            expect(body.notes).to.equal(product.notes);
            body.tags.forEach(tag => {
                expect(product.tags).to.contain(tag.name);
            });
        });

        cy.get('[data-testid="productCardContainer__automated_test_product"]')
            .should('contain', product.name)
            .should('contain', product.location)
            .should('contain', product.tags[0])
            .should('contain', product.tags[1]);
    });

    it('Edit a product', () => {
        cy.intercept('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');
        cy.intercept('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postNewTag');
        cy.intercept('PUT', Cypress.env('API_PRODUCTS_PATH') + '/**').as('updateProduct');

        cy.get('[data-testid=editProductIcon__baguette_bakery]').click();
        cy.get('[data-testid=editMenuOption__edit_product]').click();

        const updateProduct = {
            name: 'Baguette Bakery 2',
            location: 'Michigan',
            archived: false,
            tags: ['Tag 1', 'Tag 2'],
            startDate: moment('01/14/2019'),
            nextPhaseDate: moment('01/18/2019'),
            notes: 'Updated',
        };
        populateProductForm(updateProduct, '01/01/2019');

        submitProductForm('Save');

        cy.wait('@updateProduct').then((interception) => {
            expect(interception?.response.statusCode).to.equal(200);
            const body = interception?.response?.body;
            expect(body.name).to.equal(updateProduct.name);
            expect(body.archived).to.equal(updateProduct.archived);
            expect(body.spaceLocation.name).to.equal(updateProduct.location);
            expect(body.startDate).to.equal(updateProduct.startDate.format('yyyy-MM-DD'));
            expect(body.endDate).to.equal(updateProduct.nextPhaseDate.format('yyyy-MM-DD'));
            expect(body.notes).to.equal(updateProduct.notes);
            body.tags.forEach(tag => {
                expect(updateProduct.tags).to.contain(tag.name);
            });
        });

        cy.get('[data-testid="productCardContainer__baguette_bakery_2"]')
            .should('contain', updateProduct.name)
            .should('contain', updateProduct.location)
            .should('contain', updateProduct.tags[0])
            .should('contain', updateProduct.tags[1]);
    });

    it('Delete a product', () => {
        cy.intercept('DELETE', Cypress.env('API_PRODUCTS_PATH') + '/**').as('deleteProduct');

        cy.get('[data-testid=editProductIcon__baguette_bakery]').click();
        cy.get('[data-testid=editMenuOption__edit_product]').click();

        cy.get('[data-testid=deleteProduct]').click();
        cy.get('[data-testid=confirmDeleteButton]').click();

        cy.wait('@deleteProduct')
            .its('response.statusCode').should('eq', 200);

        cy.get('[data-testid=editProductIcon__baguette_bakery]').should('not.exist');

    });

    it('Archive a product', () => {
        cy.contains('Baguette Bakery').should('exist');
        cy.get('[data-testid="editProductIcon__baguette_bakery"]').click();

        cy.contains('Archive Product').click();

        cy.contains('Are you sure?').should('exist');
        cy.contains('Archive').click();
        cy.contains('Baguette Bakery').should('not.exist');

        cy.get('[data-testid="calendarToggle"]').click();
        const newDate = moment(activeDateString).subtract(1, 'days').format('dddd, MMMM Do, YYYY');
        cy.get(`[aria-label="Choose ${newDate}"]`).click();
        cy.contains('Baguette Bakery').should('exist');
    });

    context('Product name field warnings', () => {
        beforeEach(() => {
            cy.get('[data-testid=editProductIcon__baguette_bakery]').click();
            cy.get('[data-testid=editMenuOption__edit_product]').click();

            cy.get('[data-testid=productFormNameField]').clear();
        });

        it('Display duplicate product name warning if product name is a duplicate', () => {
            const productName = 'My Product';
            cy.get('[data-testid=productFormNameField]')
                .focus()
                .type(productName)
                .should('have.value', productName);

            cy.get('[data-testid=productFormSubmitButton]')
                .should('have.text', 'Save').click();

            const expectedDuplicateProductNameWarningMessage = 'A product with this name already exists. Please enter a different name.';
            cy.get('[data-testid=productNameWarningMessage]')
                .should('have.text', expectedDuplicateProductNameWarningMessage);
        });

        it('Display empty product name warning if product name is empty', () => {
            cy.get('[data-testid=productFormSubmitButton]')
                .should('have.text', 'Save').click();

            const expectedEmptyProductNameWarningMessage = 'Please enter a product name.';
            cy.get('[data-testid=productNameWarningMessage]')
                .should('have.text', expectedEmptyProductNameWarningMessage);
        });
    });
});

const populateProductForm = ({name, location, tags = [], startDate, nextPhaseDate, notes}, defaultStartDate): void => {
    cy.log('Populate Product Form');

    cy.get('[data-testid=productForm]').as('productForm');
    cy.get('@productForm').should('be.visible');

    cy.get('[data-testid=productFormNameField]').clear().focus().type(name).should('have.value', name);

    cy.get('@productForm')
        .find('[id=location]')
        .focus()
        .type(location + '{enter}', {force: true});

    cy.wait('@postNewLocation');

    tags.forEach(tag => {
        cy.get('@productForm').find('[id=productTags]').focus().type(tag + '{enter}', {force: true});

        cy.wait('@postNewTag');
    });

    cy.get('#start').as('calendarStartDate');
    cy.get('#end').as('calendarEndDate');

    cy.get('@calendarStartDate')
        .should('have.value', defaultStartDate)
        .click();

    const today = defaultStartDate ? startDate : activeDateString;
    cy.getCalendarDate(today).click({force: true});

    cy.get('@calendarStartDate').should('have.value', startDate.format('MM/DD/yyyy'));
    cy.get('[data-testid=modalTitle]').click();

    cy.get('@calendarEndDate')
        .should('have.value', '')
        .click();

    cy.getCalendarDate(nextPhaseDate).click({force: true});

    cy.get('@calendarEndDate').should('have.value', nextPhaseDate.format('MM/DD/yyyy'));

    cy.get('[data-testid=formNotesToField]')
        .focus()
        .type(notes)
        .should('have.value', notes);
};

const submitProductForm = (expectedSubmitButtonText: string): void => {
    cy.get('[data-testid=productFormSubmitButton]').should('have.text', expectedSubmitButtonText).click();
    cy.get('@productForm').should('not.exist');
};
