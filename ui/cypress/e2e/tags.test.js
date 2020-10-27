/// <reference types="Cypress" />

describe('Tags',  () => {
    const locationTag = 'Middle Earth';
    const productTag = 'Flippin Sweet';
    
    beforeEach(() => {
        cy.visitBoard();
    });

    context('Add new', () => {
        beforeEach(() => {
            cy.get('[data-testid=myTagsButton]').click();

            cy.getModal()
                .should('contain', 'My Tags')
                .should('contain', 'Location Tags')
                .should('contain', 'Product Tags');
        });

        it('location tag',  () => {
            cy.get('[data-testid=tagsModalContainer__location]')
                .as('locationTagsContainer');

            cy.get('[data-testid=viewTagRow]').should('not.exist');

            cy.get('@locationTagsContainer').find('[data-testid=addNewButton__location]').click();
            cy.get('@locationTagsContainer').find('[data-testid=tagNameInput]').focus().type(locationTag).should('have.value', locationTag);
            cy.get('@locationTagsContainer').find('[data-testid=saveTagButton]').click();

            cy.get('@locationTagsContainer').find('[data-testid=viewTagRow]')
                .should(($row) => {
                    expect($row).to.contain(locationTag);
                    expect($row).to.have.descendants('[data-testid=editIcon__location]');
                    expect($row).to.have.descendants('[data-testid=deleteIcon__location]');
                });
        });

        it('product tag',  () => {
            cy.get('[data-testid=tagsModalContainer__product_tag]')
                .as('productTagsContainer');

            cy.get('[data-testid=viewTagRow]').should('not.exist');

            cy.get('@productTagsContainer').find('[data-testid=addNewButton__product_tag]').click();
            cy.get('@productTagsContainer').find('[data-testid=tagNameInput]').focus().type(productTag).should('have.value', productTag);
            cy.get('@productTagsContainer').find('[data-testid=saveTagButton]').click();

            cy.get('@productTagsContainer').find('[data-testid=viewTagRow]')
                .should(($row) => {
                    expect($row).to.contain(productTag);
                    expect($row).to.have.descendants('[data-testid=editIcon__product_tag]');
                    expect($row).to.have.descendants('[data-testid=deleteIcon__product_tag]');
                });
        });
    });
});
