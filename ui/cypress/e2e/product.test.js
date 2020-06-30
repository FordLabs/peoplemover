/// <reference types="Cypress" />
import product from '../fixtures/product';

describe('Product', () => {
    const PRODUCT_CARD_SELECTOR = '[data-testid=productCardContainer]';

    it('Create a new Product', () => {
        cy.server();
        cy.route('POST', '/api/product').as('postNewProduct');

        cy.get('[data-cy=newProductButton]').click();

        populateProductForm(product);

        submitProductForm();

        cy.wait('@postNewProduct').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(product.name);
        });

        cy.contains(product.name).parentsUntil(PRODUCT_CARD_SELECTOR)
            .should('contain', product.name)
            .should('contain', product.location)
            .should('contain', product.tags[0])
            .should('contain', product.tags[1]);
    });
});

const populateProductForm = ({ name, location, tags = [], startDate, nextPhaseDate, dorfCode, notes }) => {
    cy.log('Populate Product Form');

    cy.get('[data-testid=productForm]').as('productForm');
    cy.get('@productForm').should('be.visible');

    cy.get('[data-testid=productFormNameField]').focus().type(name);

    cy.get('@productForm').find('[id=location]').focus().type(location + '{enter}');

    tags.forEach(tag => {
        cy.get('@productForm').find('[id=productTags]').focus().type(tag + '{enter}', {force: true});
    });

    const todaysDate = Cypress.moment().format('yyyy-MM-DD');
    cy.get('[data-testid=productFormStartDateField]')
        .should('have.value', todaysDate)
        .focus()
        .type(startDate)
        .should('have.value', startDate);
    cy.get('[data-testid=productFormNextPhaseDateField]')
        .should('have.value', '')
        .focus()
        .type(nextPhaseDate)
        .should('have.value', nextPhaseDate);

    cy.get('[data-testid=productFormDorfField]').focus().type(dorfCode);
    cy.get('[data-testid=productFormArchivedCheckbox]').should('not.be.visible');
    cy.get('[data-testid=productFormNotesField]').focus().type(notes);
};

const submitProductForm = () => {
    cy.get('[data-testid=productFormSubmitButton]').click();
    cy.get('[data-testid=productForm]').should('not.be.visible');
};