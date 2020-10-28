describe('Filter', () => {
    beforeEach(() => {
        cy.visitBoard();
        cy.server();
    });

    it('Filter people by role', () => {
        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards').should('have.length', 2);
                cy.get('@peopleCards').eq(0).should('contain', 'Jane Smith');
                cy.get('@peopleCards').eq(1).should('contain', 'Bob Barker');

                cy.selectOptionFromReactSelect('[data-testid=filters]', 'THE SECOND BEST (UNDERSTUDY)');
            });

        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards');
                cy.get('@peopleCards').should('have.length', 1);
                cy.get('@peopleCards').eq(0).should('contain', 'Bob Barker');
            });

    });

    it('Filter products by location tag', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.selectOptionFromReactSelect('[data-testid=filters]', 'location1')
            .then(() => {
                cy.get('[data-testid=productCardContainer__my_product]').should('not.exist');
                cy.get('[data-testid=productCardContainer__baguette_bakery]');
            });
    });

    it('Filter products by product tag', () => {
        cy.get('[data-testid=productCardContainer__my_product]');
        cy.get('[data-testid=productCardContainer__baguette_bakery]');

        cy.selectOptionFromReactSelect('[data-testid=filters]', 'productTag1')
            .then(() => {
                cy.get('[data-testid=productCardContainer__my_product]');
                cy.get('[data-testid=productCardContainer__baguette_bakery]').should('not.exist');
            });
    });
});
