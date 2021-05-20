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

/// <reference types="Cypress" />

describe('Tags',  () => {
    const locationTag = 'Middle Earth ' + Date.now();
    const productTag = 'Flippin Sweet ' + Date.now();
    const personTag = 'Rally Deity ' + Date.now();

    beforeEach(() => {
        cy.visitSpace();
    });

    context('Add new', () => {
        beforeEach(() => {
            cy.server();
        });

        it('location tag',  () => {
            cy.get('[data-testid=dropdown_button_Product_Location]').click();
            cy.get('[data-testid=open_Product_Location_modal_button]').click();
            cy.getModal().should('contain', 'Product Location');

            cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postLocation');
            cy.get('[data-testid=tagsModalContainer__location]')
                .find('[data-testid=viewTagRow]')
                .should('have.length', 1);

            cy.get('[data-testid=addNewButton__location]').click();

            cy.get('[data-testid=tagNameInput]').focus().type(locationTag).should('have.value', locationTag);
            cy.get('[data-testid=saveTagButton]').click();

            cy.wait('@postLocation').then(() => {
                cy.get('[data-testid=tagsModalContainer__location]')
                    .find('[data-testid=viewTagRow]')
                    .should(($row) => {
                        expect($row).to.contain(locationTag);
                        expect($row).to.have.descendants('[data-testid=editIcon__location]');
                        expect($row).to.have.descendants('[data-testid=deleteIcon__location]');
                    });

                cy.closeModal();

                cy.get('[data-testid=dropdown_button_Product_Location]').click();
                cy.contains(locationTag);
            });
        });

        it('product tag',  () => {
            cy.get('[data-testid=dropdown_button_Product_Tags]').click();
            cy.get('[data-testid=open_Product_Tags_modal_button]').click();
            cy.getModal().should('contain', 'Product Tags');

            cy.route('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postProductTag');
            cy.get('[data-testid=tagsModalContainer__product_tag]')
                .find('[data-testid=viewTagRow]').should('have.length', 1);

            cy.get('[data-testid=addNewButton__product_tag]').click();
            cy.get('[data-testid=tagNameInput]').focus().type(productTag).should('have.value', productTag);
            cy.get('[data-testid=saveTagButton]').click();

            cy.wait('@postProductTag').then(() => {
                cy.get('[data-testid=tagsModalContainer__product_tag]').find('[data-testid=viewTagRow]')
                    .should(($row) => {
                        expect($row).to.contain(productTag);
                        expect($row).to.have.descendants('[data-testid=editIcon__product_tag]');
                        expect($row).to.have.descendants('[data-testid=deleteIcon__product_tag]');
                    });

                cy.closeModal();

                cy.get('[data-testid=dropdown_button_Product_Tags]').click();
                cy.contains(productTag);
            });
        });

        it('person tag', () => {
            cy.get('[data-testid=dropdown_button_Person_Tags]').click();
            cy.get('[data-testid=open_Person_Tags_modal_button]').click();
            cy.getModal().should('contain', 'Person Tags');

            cy.route('POST', Cypress.env('API_PERSON_TAG_PATH')).as('postPersonTag');
            cy.get('[data-testid=tagsModalContainer__person_tag]')
                .find('[data-testid=viewTagRow]').should('have.length', 1);

            cy.get('[data-testid=addNewButton__person_tag]').click();
            cy.get('[data-testid=tagNameInput]').focus().type(personTag).should('have.value', personTag);
            cy.get('[data-testid=saveTagButton]').click();

            cy.wait('@postPersonTag').then(() => {
                cy.get('[data-testid=tagsModalContainer__person_tag]').find('[data-testid=viewTagRow]')
                    .should(($row) => {
                        expect($row).to.contain(personTag);
                        expect($row).to.have.descendants('[data-testid=editIcon__person_tag]');
                        expect($row).to.have.descendants('[data-testid=deleteIcon__person_tag]');
                    });

                cy.closeModal();

                cy.get('[data-testid=dropdown_button_Person_Tags]').click();
                cy.contains(personTag);
            });
        });
    });
});
