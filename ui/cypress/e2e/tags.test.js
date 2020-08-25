/// <reference types="Cypress" />
const spaceUuid = Cypress.env('SPACE_UUID');
describe('Tags',  () => {
    const locationTag = 'Middle Earth';
    const productTag = 'Flippin Sweet';
    
    beforeEach(() => {
        cy.resetSpace(spaceUuid)

        cy.visitBoard();
    });

    context('Add new', () => {
        beforeEach(() => {
            cy.get('[data-testid=myTagsButton]').click();

            cy.getModal().should('contain', 'My Tags');
        });

        it('location tag',  () => {
            cy.contains('Location Tags')
                .parent('[data-testid=myTraitsModalContainer]')
                .as('locationTagsContainer');

            cy.get('[data-testid=traitRow]').should('not.exist');

            cy.get('@locationTagsContainer').find('[data-testid=addNewLocation]').click();
            cy.get('@locationTagsContainer').find('[data-testid=traitName]').focus().type(locationTag).should('have.value', locationTag);
            cy.get('@locationTagsContainer').find('[data-testid=saveTraitsButton]').click();

            cy.get('@locationTagsContainer').find('[data-testid=traitRow]')
                .should(($row) => {
                    expect($row).to.contain(locationTag);
                    expect($row).to.have.descendants('[data-testid=locationEditIcon]');
                    expect($row).to.have.descendants('[data-testid=locationDeleteIcon]');
                });
        });

        it('product tag',  () => {
            cy.contains('Product Tags')
                .parent('[data-testid=myTraitsModalContainer]')
                .as('productTagsContainer');

            cy.get('[data-testid=traitRow]').should('not.exist');

            cy.get('@productTagsContainer').find('[data-testid=addNewProductTag]').click();
            cy.get('@productTagsContainer').find('[data-testid=traitName]').focus().type(productTag).should('have.value', productTag);
            cy.get('@productTagsContainer').find('[data-testid=saveTraitsButton]').click();

            cy.get('@productTagsContainer').find('[data-testid=traitRow]')
                .should(($row) => {
                    expect($row).to.contain(productTag);
                    expect($row).to.have.descendants('[data-testid=producttagEditIcon]');
                    expect($row).to.have.descendants('[data-testid=producttagDeleteIcon]');
                });
        });
    });
});
