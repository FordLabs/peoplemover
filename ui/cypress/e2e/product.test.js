/// <reference types="Cypress" />
import product from '../fixtures/product';

describe('Product', () => {
    beforeEach(() => {
        cy.visitBoard();
    });

    it('Create a new product', () => {
        cy.server();
        cy.route('POST', Cypress.env('API_PRODUCTS_PATH')).as('postNewProduct');

        cy.get(product.name).should('not.exist');

        cy.get('[data-cy=newProductButton]').click();

        cy.getModal().should('contain', 'Create New Product');

        populateProductForm(product);

        submitProductForm();

        cy.wait('@postNewProduct').should(xhr => {
            expect(xhr?.status).to.equal(200);
            const body = xhr?.response?.body;
            expect(body.name).to.equal(product.name);
            expect(body.archived).to.equal(product.archived);
            expect(body.spaceLocation.name).to.equal(product.location);
            expect(body.startDate).to.equal(product.startDate.format('yyyy-MM-DD'));
            expect(body.endDate).to.equal(product.nextPhaseDate.format('yyyy-MM-DD'));
            expect(body.notes).to.equal(product.notes);
            body.productTags.forEach(tag => {
                expect(product.tags).to.contain(tag.name);
            });
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

    cy.get('#start').as('calendarStartDate');
    cy.get('#end').as('calendarEndDate');

    const todaysDate = Cypress.moment().format('MM/DD/yyyy');
    cy.get('@calendarStartDate')
        .should('have.value', todaysDate)
        .click();

    const today = Cypress.moment();
    cy.get(dateSelector(today)).click({force: true});

    cy.get('@calendarStartDate').should('have.value', startDate.format('MM/DD/yyyy'));
    cy.get('.modalTitle').click();

    cy.get('@calendarEndDate')
        .should('have.value', '')
        .click();

    const tomorrow = Cypress.moment().add(1, 'days');
    cy.get(dateSelector(tomorrow)).click({force: true});

    cy.get('@calendarEndDate').should('have.value', nextPhaseDate.format('MM/DD/yyyy'));

    cy.get('[data-testid=formNotesToField]')
        .focus()
        .type(notes)
        .should('have.value', notes);
};

const dateSelector = (moment) => {
    const dateLabel = moment.format( 'dddd, MMMM Do, yyyy');
    return `[aria-label="Choose ${dateLabel}"]`;
};

const submitProductForm = () => {
    cy.get('[data-testid=productFormSubmitButton]').click();
    cy.get('@productForm').should('not.be.visible');
};
