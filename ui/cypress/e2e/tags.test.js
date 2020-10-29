/// <reference types="Cypress" />

describe('Tags',  () => {
    const locationTag = 'Middle Earth';
    const productTag = 'Flippin Sweet';
    
    beforeEach(() => {
        cy.visitBoard();
    });

    context('Add new', () => {
        beforeEach(() => {
            cy.server();

            cy.get('[data-testid=myTagsButton]').click();

            cy.getModal()
                .should('contain', 'My Tags')
                .should('contain', 'Location Tags')
                .should('contain', 'Product Tags');
        });

        it('location tag',  () => {
            cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postLocation');
            cy.get('[data-testid=viewTagRow]').should('not.exist');

            cy.get('[data-testid=addNewButton__location]').click();
            cy.get('[data-testid=tagNameInput]').focus().type(locationTag).should('have.value', locationTag);
            cy.get('[data-testid=saveTagButton]').click();

            cy.wait('@postLocation').then(() => {
                cy.get('[data-testid=tagsModalContainer__location]').find('[data-testid=viewTagRow]')
                    .should(($row) => {
                        expect($row).to.contain(locationTag);
                        expect($row).to.have.descendants('[data-testid=editIcon__location]');
                        expect($row).to.have.descendants('[data-testid=deleteIcon__location]');
                    });

                cy.closeModal();

                cy.selectOptionFromReactSelect('[data-testid=filters]', locationTag);
            });
        });

        it('product tag',  () => {
            cy.route('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postProductTag');
            cy.get('[data-testid=viewTagRow]').should('not.exist');

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

                cy.selectOptionFromReactSelect('[data-testid=filters]', productTag);
            });
        });
    });
});
