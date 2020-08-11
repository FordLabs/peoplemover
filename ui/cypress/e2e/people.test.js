/// <reference types="Cypress" />

import person from '../fixtures/person';
const spaceId = Cypress.env('SPACE_ID');

describe('People', () => {
    beforeEach(() => {
        cy.resetPerson(person);

        cy.visitBoard();
    });

    it('Add a new person', () => {
        cy.server();
        cy.route('POST', `/api/person/${spaceId}`).as('postNewPerson');

        cy.contains(person.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Create New Person');

        populatePersonForm(person);

        submitPersonForm();

        cy.wait('@postNewPerson').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(person.name);
        }).then(xhr => {
            const personId = xhr?.response?.body.id;

            cy.contains(person.assignTo)
                .parentsUntil('[data-testid=productPeopleContainer]')
                .find(`[data-testid=assignmentCard${personId}info]`)
                .should('contain', person.name)
                .should('contain', person.role)
                .then(() => {
                    if (person.isNew) {
                        cy.contains(person.assignTo)
                            .parentsUntil(`[data-testid=assignmentCard${personId}]`)
                            .find('[data-testid=newBadge]')
                            .should('be.visible');
                    }
                });

            cy.get('[data-testid=reassignmentDrawer]').as('reassignmentDrawer');

            cy.get('@reassignmentDrawer')
                .should('contain', 'Reassigned')
                .find('[data-testid=countBadge]').should('have.text', '1');

            cy.get('@reassignmentDrawer')
                .find('[data-testid=reassignmentContainer] [data-testid=reassignmentSection]')
                .should('have.length', 1)
                .eq(0)
                .should('contain', person.name)
                .should('contain', person.role)
                .should('contain', `Assigned to ${person.assignTo}`);
        });
    });
});

const populatePersonForm = ({ name, isNew = false, role, assignTo, notes }) => {
    cy.get('[data-testid=personForm]').as('personForm');
    cy.get('@personForm').should('be.visible');

    cy.get('[data-testid=personFormNameField]')
        .focus()
        .type(name)
        .should('have.value', name);

    if (isNew) {
        cy.get('[data-testid=personFormIsNewCheckbox]')
            .check()
            .should('be.checked');
    }

    cy.get('@personForm').find('[id=role]').focus().type(role + '{enter}');

    cy.get('@personForm').find('[id=product]').type(assignTo + '{enter}');

    cy.get('[data-testid=personFormNotesToField]').focus().type(notes).should('have.value', notes);
};

const submitPersonForm = () => {
    cy.get('[data-testid=personFormSubmitButton]').should('have.value', 'Create').click();
    cy.get('@personForm').should('not.be.visible');
};
