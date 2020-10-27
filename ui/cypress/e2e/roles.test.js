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

        cy.get('[data-testid=tagName__role]').contains(mockRole).should('not.exist');

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

        cy.contains(mockRole).parent('[data-testid=viewTagRow]').should(($lis) => {
            expect($lis).to.have.descendants('[data-testid=editIcon__role]');
            expect($lis).to.have.descendants('[data-testid=deleteIcon__role]');
            expect($lis).to.have.descendants('[data-testid=myRolesCircle]');
        }).then(($lis) => {
            cy.get($lis).find('[data-testid=myRolesCircle]').should('have.css', 'background-color', pink);
        });

        cy.closeModal();
    });
});
