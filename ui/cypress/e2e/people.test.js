/// <reference types="Cypress" />
import person from '../fixtures/person';
const date = Cypress.moment().format('yyyy-MM-DD');

describe('People', () => {
    beforeEach(() => {
        cy.visitBoard();
    });

    it('Add a new person', () => {
        cy.server();

        cy.route('POST', Cypress.env('API_PERSON_PATH')).as('postNewPerson');
        cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}/${date}`).as('getUpdatedProduct');

        cy.contains(person.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Create New Person');

        populatePersonForm(person);

        submitPersonForm();

        let personId;
        cy.wait(['@postNewPerson', '@getUpdatedProduct'])
            .should((xhrs) => {
                const postNewPersonXhr = xhrs[0];
                const getUpdatedProductXhr = xhrs[1];

                expect(postNewPersonXhr?.status).to.equal(200);
                expect(postNewPersonXhr?.response?.body.name).to.equal(person.name);
                expect(getUpdatedProductXhr?.status).to.equal(200);
                personId = postNewPersonXhr?.response?.body.id;
            }).then(() => {
                cy.get('[data-testid=productPeopleContainer]')
                    .eq(1).as('myProductCardContainer');

                cy.get('@myProductCardContainer')
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

    cy.get('[data-testid=formNotesToField]').clear().type(notes).should('have.value', notes);
};

const submitPersonForm = () => {
    cy.get('[data-testid=personFormSubmitButton]').should('have.value', 'Create').click();
    cy.get('@personForm').should('not.be.visible');
};
