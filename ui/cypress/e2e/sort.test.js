import person from "../fixtures/person";

describe('Sort', () => {
    beforeEach(() => {
        cy.visitBoard();
        cy.server();
    });

    it('Sort products alphabetically', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.selectOptionFromReactSelect('[data-testid=sortBy]', 'Alphabetical')
            .then(() => {
                cy.get('[data-testid=productListSortedContainer]')
                    .find('[data-testid*=productCardContainer__]')
                    .should('have.length', 2)
                    .eq(0)
                    .should('contain', 'Baguette Bakery');

                cy.get('[data-testid=productListSortedContainer]')
                    .find('[data-testid*=productCardContainer__]')
                    .eq(1)
                    .should('contain', 'My Product');

            });
    });

    it('Sort products by location', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.selectOptionFromReactSelect('[data-testid=sortBy]', 'Location')
            .then(() => {
                cy.get('[data-testid=productListGroupedContainer]')
                    .find('[data-testid=productGroup]')
                    .should('have.length', 2)
                    .eq(0)
                    .should('contain', 'Baguette Bakery')
                    .should('contain', 'location1');

                cy.get('[data-testid=productListGroupedContainer]')
                    .find('[data-testid=productGroup]')
                    .eq(1)
                    .should('contain', 'My Product')
                    .should('contain', 'No Location');

            });
    });

    it('Sort products by product tag', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.selectOptionFromReactSelect('[data-testid=sortBy]', 'Product Tag')
            .then(() => {
                cy.get('[data-testid=productListGroupedContainer]')
                    .find('[data-testid=productGroup]')
                    .should('have.length', 2)
                    .eq(0)
                    .should('contain', 'My Product')
                    .should('contain', 'productTag1');

                cy.get('[data-testid=productListGroupedContainer]')
                    .find('[data-testid=productGroup]')
                    .eq(1)
                    .should('contain', 'Baguette Bakery')
                    .should('contain', 'No Product Tag');

            });
    });
});
