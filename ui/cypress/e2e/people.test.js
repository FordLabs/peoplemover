/// <reference types="Cypress" />
import person from '../fixtures/person';
const date = Cypress.moment().format('yyyy-MM-DD');

describe('People', () => {
    beforeEach(() => {
        cy.visitBoard();
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');
    });

    it('Add a new person', () => {
        cy.route('POST', Cypress.env('API_PERSON_PATH')).as('postNewPerson');
        cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${date}`).as('getUpdatedProduct');
        cy.route('GET', Cypress.env('API_PERSON_PATH')).as('getPeople');

        cy.contains(person.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Create New Person');

        populatePersonForm(person);

        submitPersonForm('Create');

        let assignmentId;
        cy.wait(['@postNewPerson', '@getUpdatedProduct', '@getPeople'])
            .should((xhrs) => {
                const postNewPersonXhr = xhrs[0];
                const getUpdatedProductXhr = xhrs[1];

                expect('@getUpdatedProduct status: ' + getUpdatedProductXhr?.status)
                    .to.equal('@getUpdatedProduct status: ' + 200);
                expect('@postNewPerson status: ' + postNewPersonXhr.status)
                    .to.equal('@postNewPerson status: ' + 200);
                const personData = postNewPersonXhr.response.body || {};
                expect(personData.name).to.equal(person.name);
                expect(personData.newPerson).to.equal(person.isNew);
                expect(personData.notes).to.equal(person.notes);
                expect(personData.spaceRole.name).to.equal(person.role);

                const productData = getUpdatedProductXhr.response.body || [];
                assignmentId = productData
                    .find(product => product.name === person.assignTo).assignments
                    .find(assignment => assignment.person.id === personData.id).id;

            }).then(() => {
                cy.get('[data-testid=productPeopleContainer]')
                    .eq(1).as('myProductCardContainer');

                cy.get('@myProductCardContainer')
                    .find(`[data-testid=assignmentCard${assignmentId}info]`)
                    .should('contain', person.name)
                    .should('contain', person.role)
                    .then(() => {
                        if (person.isNew) {
                            cy.contains(person.assignTo)
                                .parentsUntil(`[data-testid=assignmentCard${assignmentId}]`)
                                .find('[data-testid=newBadge]')
                                .should('be.visible');
                        }
                    });

                cy.get('[data-testid=reassignmentDrawer]').as('reassignmentDrawer');

                cy.get('@reassignmentDrawer')
                    .should('contain', 'Reassigned')
                    .find('[data-testid=countBadge]').should('have.text', '2');

                cy.get('@reassignmentDrawer')
                    .find('[data-testid=reassignmentContainer] [data-testid=reassignmentSection]')
                    .should('have.length', 2)
                    .eq(0)
                    .should('contain', person.name)
                    .should('contain', person.role)
                    .should('contain', `Assigned to ${person.assignTo}`);
            });
    });

    it('Edit a person', () => {
        cy.route('PUT', Cypress.env('API_PERSON_PATH') + '/**').as('updatePerson');
        const editedPerson = {
            name: 'Jane Bob',
            isNew: false,
            role: 'The medium',
            assignTo: 'My Product',
            notes: 'BOB',
        };
        cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
        cy.get('[data-testid=editMenuOption__edit_person]').click();
        populatePersonForm(editedPerson);
        submitPersonForm('Save');

        cy.wait('@updatePerson')
            .should((xhr) => {
                const personData = xhr.response.body || {};
                expect('@updatedPersonXHR status: ' + xhr?.status).to.equal('@updatedPersonXHR status: ' + 200);
                expect(personData.name).to.equal(editedPerson.name);
                expect(personData.newPerson).to.equal(editedPerson.isNew);
                expect(personData.notes).to.equal(editedPerson.notes);
                expect(personData.spaceRole.name).to.equal(editedPerson.role);
            });

        cy.get(`[data-testid=assignmentCard__jane_bob]`)
            .should('contain', editedPerson.name)
            .should('contain', editedPerson.role);
    });

    it('Delete a person', () => {
        cy.route('DELETE', Cypress.env('API_PERSON_PATH') + '/**').as('deletePerson');

        cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
        cy.get('[data-testid=editMenuOption__edit_person]').click();
        cy.get('[data-testid=deletePersonButton]').click();
        cy.get('[data-testid=confirmDeleteButton]').click();

        cy.wait('@deletePerson')
            .should((xhr) => {
                expect(xhr?.status).to.equal(200);
            });
        cy.get('[data-testid=editPersonIconContainer__jane_smith]').should('not.exist');
    });

    context('Drag and Drop', () => {
        it('Drag and drop person from one product to another product', () => {
            cy.server();
            cy.route('GET', Cypress.env('API_PRODUCTS_PATH') + '?requestedDate=' + date).as('getProducts');
            cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Jane Smith').should('not.exist');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid*=assignmentCard]').contains('Jane Smith')
                    .trigger('mousedown', { button: 0 })
                    .trigger('mousemove', {
                        clientX: rect.x,
                        clientY: rect.y,
                        screenX: rect.x,
                        screenY: rect.y,
                        pageX: rect.x,
                        pageY: rect.y,
                    })
                    .trigger('mouseup', { force: true });

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Jane Smith');
                });
            });
        });

        it('Drag and drop person from a product to unassigned', () => {
            cy.get('[data-testid=unassignedDrawer]').click();

            cy.server();
            cy.route('GET', Cypress.env('API_PRODUCTS_PATH') + '?requestedDate=' + date).as('getProducts');
            cy.get('[data-testid=productDrawerContainer__unassigned]').contains('Jane Smith').should('not.exist');

            cy.get('[data-testid=productDrawerContainer__unassigned]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid*=assignmentCard]').contains('Jane Smith')
                    .trigger('mousedown', { button: 0 })
                    .trigger('mousemove', {
                        clientX: rect.x,
                        clientY: rect.y,
                        screenX: rect.x,
                        screenY: rect.y,
                        pageX: rect.x,
                        pageY: rect.y,
                    })
                    .trigger('mouseup', { force: true });

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productDrawerContainer__unassigned]').contains('Jane Smith');
                });
            });
        });

        it('Drag and drop person from a unassigned to a product', () => {
            cy.get('[data-testid=unassignedDrawer]').click();

            cy.server();
            cy.route('GET', Cypress.env('API_PRODUCTS_PATH') + '?requestedDate=' + date).as('getProducts');
            cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Adam Sandler').should('not.exist');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid*=assignmentCard]').contains('Adam Sandler')
                    .trigger('mousedown', { button: 0 })
                    .trigger('mousemove', {
                        clientX: rect.x,
                        clientY: rect.y,
                        screenX: rect.x,
                        screenY: rect.y,
                        pageX: rect.x,
                        pageY: rect.y,
                    })
                    .trigger('mouseup', { force: true });

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Adam Sandler');
                });
            });
        });
    });
});

const populatePersonForm = ({ name, isNew = false, role, assignTo, notes }) => {
    cy.get('[data-testid=personForm]').as('personForm');
    cy.get('@personForm').should('be.visible');

    cy.get('[data-testid=personFormNameField]')
        .clear()
        .focus()
        .type(name)
        .should('have.value', name);

    if (isNew) {
        cy.get('[data-testid=personFormIsNewCheckbox]')
            .check()
            .should('be.checked');
    }

    cy.get('@personForm')
        .find('[id=role]')
        .focus()
        .type(role + '{enter}');
    
    cy.wait('@postNewRole');

    if (isNew) {
        cy.get('@personForm')
            .find('.MultiSelect__value-container input')
            .focus()
            .type(assignTo + '{enter}');
    }

    cy.get('[data-testid=formNotesToField]').clear().type(notes).should('have.value', notes);
};

const submitPersonForm = (expectedSubmitButtonText) => {
    cy.get('[data-testid=personFormSubmitButton]').should('have.text', expectedSubmitButtonText).click();
    cy.get('@personForm').should('not.be.visible');
};
