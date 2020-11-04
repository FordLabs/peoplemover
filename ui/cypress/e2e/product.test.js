/// <reference types="Cypress" />
import product from '../fixtures/product';

describe('Product', () => {
    beforeEach(() => {
        cy.visitBoard();
        cy.server();
    });

    it('Create a new product', () => {
        cy.route('POST', Cypress.env('API_PRODUCTS_PATH')).as('postNewProduct');
        cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');
        cy.route('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postNewTag');

        cy.get(product.name).should('not.exist');

        cy.get('[data-testid=newProductButton]').click();

        cy.getModal().should('contain', 'Create New Product');

        const todayDate = Cypress.moment().format('MM/DD/yyyy');
        populateProductForm(product, todayDate);

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

        cy.get('[data-testid="productCardContainer__automated_test_product"]')
            .should('contain', product.name)
            .should('contain', product.location)
            .should('contain', product.tags[0])
            .should('contain', product.tags[1]);
    });

    it('Edit a product', () => {
        cy.route('POST', Cypress.env('API_LOCATION_PATH')).as('postNewLocation');
        cy.route('POST', Cypress.env('API_PRODUCT_TAG_PATH')).as('postNewTag');
        cy.route('PUT', Cypress.env('API_PRODUCTS_PATH') + '/**').as('updateProduct');

        cy.get('[data-testid=editProductIcon__baguette_bakery]').click();
        cy.get('[data-testid=editMenuOption__edit_product]').click();

        const updateProduct = {
            name: 'Baguette Bakery 2',
            location: 'Michigan',
            archived: false,
            tags: ['Tag 1', 'Tag 2'],
            startDate: Cypress.moment('01/02/2019'),
            nextPhaseDate: Cypress.moment().add(1, 'days'),
            notes: 'Updated',
        };
        populateProductForm(updateProduct, '01/01/2019');

        submitProductForm();

        cy.wait('@updateProduct').should(xhr => {
            expect(xhr?.status).to.equal(200);
            const body = xhr?.response?.body;
            expect(body.name).to.equal(updateProduct.name);
            expect(body.archived).to.equal(updateProduct.archived);
            expect(body.spaceLocation.name).to.equal(updateProduct.location);
            expect(body.startDate).to.equal(updateProduct.startDate.format('yyyy-MM-DD'));
            expect(body.endDate).to.equal(updateProduct.nextPhaseDate.format('yyyy-MM-DD'));
            expect(body.notes).to.equal(updateProduct.notes);
            body.productTags.forEach(tag => {
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
        cy.route('DELETE', Cypress.env('API_PRODUCTS_PATH') + '/**').as('deleteProduct');

        cy.get('[data-testid=editProductIcon__baguette_bakery]').click();
        cy.get('[data-testid=editMenuOption__edit_product]').click();

        cy.get('[data-testid=deleteProduct]').click();
        cy.get('[data-testid=confirmDeleteButton]').click();

        cy.wait('@deleteProduct').should(xhr => {
            expect(xhr?.status).to.equal(200);
        });

        cy.get('[data-testid=editProductIcon__baguette_bakery]').should('not.exist');

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

const populateProductForm = ({name, location, tags = [], startDate, nextPhaseDate, notes}, defaultStartDate) => {
    cy.log('Populate Product Form');

    cy.get('[data-testid=productForm]').as('productForm');
    cy.get('@productForm').should('be.visible');

    cy.get('[data-testid=productFormNameField]').clear().focus().type(name).should('have.value', name);

    cy.get('@productForm')
        .find('[id=location]')
        .focus()
        .type(location + '{enter}');

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
    
    const today = defaultStartDate ? Cypress.moment(startDate) : Cypress.moment();
    cy.get(dateSelector(today)).click({force: true});

    cy.get('@calendarStartDate').should('have.value', startDate.format('MM/DD/yyyy'));
    cy.get('.modalTitle').click();

    cy.get('@calendarEndDate')
        .should('have.value', '')
        .click();

    const tomorrow = Cypress.moment(nextPhaseDate)
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
