/// <reference types="Cypress" />
import person from '../fixtures/person';

describe('Roles', () => {
    const mockRole = person.role;
    const mockColor = { id: 7, color: '#FCBAE9' };
    const pink = 'rgb(252, 186, 233)';
    const defaultColor = 'rgb(255, 255, 255)';

    beforeEach(() => {
        cy.visitBoard();
    });

    it('Add a new role', () => {
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');

        cy.get('[data-testid=myRolesButton]').click();

        cy.getModal().should('contain', 'My Roles');

        cy.get('[data-testid=givenroleName]').contains(mockRole).should('not.exist');

        cy.get('[data-testid=addNewButton__role]').click();

        cy.get('[data-testid=editTagRow__role]').as('colorDropdownToggle');

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', defaultColor);

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectDropdownToggle]').click();

        cy.get('[data-testid=selectOption__6]').as('colorOption');

        cy.get('@colorOption')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('@colorOption').click();

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('[data-testid=tagNameInput]').clear().type(mockRole).should('have.value', mockRole);

        cy.get('[data-testid=saveTagButton]').click();

        cy.wait('@postNewRole').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(mockRole);
            expect(xhr?.response?.body.color).to.deep.equal(mockColor);
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
                cy.get('@peopleCards').should('have.length', 2);
                cy.get('@peopleCards').eq(0).should('contain', 'Jane Smith');
                cy.get('@peopleCards').eq(1).should('contain', 'Bob Barker');

                cy.selectOptionFromReactSelect('[data-testid=filters]', 'THE SECOND BEST (UNDERSTUDY)');
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
