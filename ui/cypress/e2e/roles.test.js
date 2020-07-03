/// <reference types="Cypress" />

import person from '../fixtures/person';
const spaceId = Cypress.env('SPACE_ID');

const yellow = 'rgb(255, 255, 0)';
const pink = 'rgb(255, 0, 255)';
const blue = 'rgb(0, 255, 255)';
const expectedCircleColors = [yellow, pink, blue];

describe('Roles', () => {
    it('Add New Role', () => {
        cy.server();
        cy.route('POST', `/api/role/${spaceId}`).as('postNewRole');

        cy.get('[data-testid=myRolesButton]').click();

        cy.getModal().should('contain', 'My Roles');

        cy.get('[data-testid=addNewRole]').click();

        cy.get('[data-testid=traitName]').focus().type(person.role);

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
            expect(xhr?.response?.body.name).to.equal(person.role);
        });

        cy.contains(person.role).parent('[data-testid=traitRow]').should(($lis) => {
            expect($lis).to.have.descendants('[data-testid=roleEditIcon]');
            expect($lis).to.have.descendants('[data-testid=roleDeleteIcon]');
            expect($lis).to.have.descendants('[data-testid=myRolesCircle]');
        }).then(($lis) => {
            cy.get($lis).find('[data-testid=myRolesCircle]').should('have.css', 'background-color', pink);
        });

        cy.closeModal();
    });
});