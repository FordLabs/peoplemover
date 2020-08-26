/// <reference types="Cypress" />
import product from '../fixtures/product';

const spaceUuid = Cypress.env('SPACE_UUID');

describe('Product', () => {
    beforeEach(() => {
        cy.resetSpace(spaceUuid);
        cy.visitBoard();
    });

    it('Create a new product', () => {
        cy.server();
        cy.route('POST', '/api/product').as('postNewProduct');

        cy.get(product.name).should('not.exist');

        cy.get('[data-cy=newProductButton]').click();

        cy.getModal().should('contain', 'Create New Product');

        populateProductForm(product);

        submitProductForm();

        cy.wait('@postNewProduct').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(product.name);
        });

        cy.contains(product.name).parentsUntil('[data-testid=productCardContainer]')
            .should('contain', product.name)
            .should('contain', product.location)
            .should('contain', product.tags[0])
            .should('contain', product.tags[1]);
    });
});

const populateProductForm = ({name, location, tags = [], startDate, nextPhaseDate, notes}) => {
    cy.log('Populate Product Form');

    cy.get('[data-testid=productForm]').as('productForm');
    cy.get('@productForm').should('be.visible');

    cy.get('[data-testid=productFormNameField]').focus().type(name).should('have.value', name);

    cy.get('@productForm').find('[id=location]').focus().type(location + '{enter}');

    tags.forEach(tag => {
        cy.get('@productForm').find('[id=productTags]').focus().type(tag + '{enter}', {force: true});
    });

    const todaysDate = Cypress.moment().format('MM/DD/yyyy');
    cy.get('#start')
        .should('have.value', todaysDate)
        .focus()
        .type(startDate)
        .should('have.value', startDate);

    cy.get('#end')
        .should('have.value', '')
        .focus()
        .type(nextPhaseDate)
        .should('have.value', nextPhaseDate);
    cy.get('[data-testid=modalPopupContainer]').click();

    cy.get('[data-testid=formNotesToField]').focus().type(notes).should('have.value', notes);
};

const submitProductForm = () => {
    cy.get('[data-testid=productFormSubmitButton]').click();
    cy.get('@productForm').should('not.be.visible');
};
