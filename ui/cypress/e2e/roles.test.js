/// <reference types="Cypress" />

import person from '../fixtures/person';
const spaceId = Cypress.env('SPACE_ID');

describe('Roles', () => {
    const mockRole = person.role;
    const yellow = 'rgb(255, 255, 0)';
    const pink = 'rgb(255, 0, 255)';
    const blue = 'rgb(0, 255, 255)';
    const expectedCircleColors = [yellow, pink, blue];

    beforeEach(() => {
        cy.resetRole(mockRole);

        cy.visitBoard();
    });

    it('Add a new role', () => {
        cy.server();
        cy.route('POST', `/api/role/${spaceId}`).as('postNewRole');

        cy.get('[data-testid=myRolesButton]').click();

        cy.getModal().should('contain', 'My Roles');

        cy.get('[data-testid=givenroleName]').contains(mockRole).should('not.exist');

        cy.get('[data-testid=addNewRole]').click();

        cy.get('[data-testid=traitName]').focus().type(mockRole).should('have.value', mockRole);

        cy.get('[data-testid=selectRoleCircle]')
            .should('have.length', 3)
            .each(($circle, index, $list) => {
                cy.get($circle).should('have.css', 'background-color', expectedCircleColors[index]);
            })
            .then(($circles) => {
                $circles.eq(1).click();
            });

        cy.get('[data-testid=saveTraitsButton]').click();

        cy.wait('@postNewRole').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(mockRole);
        });

        cy.contains(mockRole).parent('[data-testid=traitRow]').should(($lis) => {
            expect($lis).to.have.descendants('[data-testid=roleEditIcon]');
            expect($lis).to.have.descendants('[data-testid=roleDeleteIcon]');
            expect($lis).to.have.descendants('[data-testid=myRolesCircle]');
        }).then(($lis) => {
            cy.get($lis).find('[data-testid=myRolesCircle]').should('have.css', 'background-color', pink);
        });

        cy.closeModal();
    });

    it('Filter people by role', () => {
        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards').should('have.length', 3);
                cy.get('@peopleCards').eq(0).should('contain', 'Jane Smith');
                cy.get('@peopleCards').eq(1).should('contain', 'Bob Barker');

                cy.selectOptionFromReactSelect('[data-testid=filterByDropDownContainer]', 'THE SECOND BEST (UNDERSTUDY)');
            });

        cy.contains('My Product').parentsUntil('[data-testid=productCardContainer]')
            .then(($container) => {
                cy.get($container).find('[data-testid=productPeopleContainer]').children().as('peopleCards');
                cy.get('@peopleCards')
                cy.get('@peopleCards').should('have.length', 1);
                cy.get('@peopleCards').eq(0).should('contain', 'Bob Barker');
            });

    });
});
