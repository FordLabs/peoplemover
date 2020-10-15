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

        xit('location tag',  () => {
            cy.get('[data-testid=tagsModalContainer__location]')
                .as('locationTagsContainer');

            cy.get('[data-testid=traitRow]').should('not.exist');

            cy.get('@locationTagsContainer').find('[data-testid=addNewButton__location]').click();
            cy.get('@locationTagsContainer').find('[data-testid=tagNameInput]').focus().type(locationTag).should('have.value', locationTag);
            cy.get('@locationTagsContainer').find('[data-testid=saveTagButton]').click();

            cy.get('@locationTagsContainer').find('[data-testid=traitRow]')
                .should(($row) => {
                    expect($row).to.contain(locationTag);
                    expect($row).to.have.descendants('[data-testid=locationEditIcon]');
                    expect($row).to.have.descendants('[data-testid=locationDeleteIcon]');
                });
        });

        xit('product tag',  () => {
            cy.get('[data-testid=tagsModalContainer__product_tag]')
                .as('productTagsContainer');

            cy.get('[data-testid=traitRow]').should('not.exist');

            cy.get('@productTagsContainer').find('[data-testid=addNewButton__product_tag]').click();
            cy.get('@productTagsContainer').find('[data-testid=tagNameInput]').focus().type(productTag).should('have.value', productTag);
            cy.get('@productTagsContainer').find('[data-testid=saveTagButton]').click();

            cy.get('@productTagsContainer').find('[data-testid=traitRow]')
                .should(($row) => {
                    expect($row).to.contain(productTag);
                    expect($row).to.have.descendants('[data-testid=producttagEditIcon]');
                    expect($row).to.have.descendants('[data-testid=producttagDeleteIcon]');
                });
        });
    });
});
