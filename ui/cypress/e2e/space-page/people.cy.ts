/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as moment from 'moment';
import person, {Person} from '../../fixtures/person';

const activeDateString = '07/13/2022';
const notActiveDateString = '07/20/2022';
const activeDate = new Date(activeDateString);
const keycodes = {
    space: 32,
    arrowRight: 39,
    arrowLeft: 37,
};

describe('People', () => {
    const highlightClass = 'react-datepicker__day--highlighted';

    beforeEach(() => {
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');
        cy.route('POST', Cypress.env('API_PERSON_PATH')).as('postNewPerson');
        cy.route('GET', Cypress.env('API_PERSON_PATH')).as('getPeople');

        cy.clock(activeDate);
        cy.visitSpace(undefined, '', activeDate);

        cy.log('**The archived and unassigned drawers should be closed by default**');
        cy.contains('Adam Sandler').should('not.exist');
        cy.contains('[data-testid*=archivedProduct_]', 'Archived Product').should('not.exist');
    });

    it('Create a new assigned person', () => {
        cy.spyOnGetProductsByDate(activeDateString);

        getCalendarToggle().click();
        cy.getCalendarDate(activeDateString).should('have.class', 'react-datepicker__day--today');
        cy.getCalendarDate(notActiveDateString).should('not.have.class', highlightClass).click();

        cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${moment(notActiveDateString).format('yyyy-MM-DD')}`).as('getProductsByDate');

        cy.get('[data-testid=reassignmentDrawer]').as('reassignmentDrawer');

        cy.get('@reassignmentDrawer')
            .should('contain', 'Reassigned')
            .find('[data-testid=reassignmentDrawerCountBadge]').should('not.exist');

        const assignedPerson = {...person};

        cy.contains(assignedPerson.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Add New Person');

        populatePersonForm(assignedPerson);

        submitPersonForm('Add');

        cy.wait(['@postNewPerson', '@getProductsByDate', '@getPeople'])
            .should((xhrs: Cypress.ObjectLike[]) => {
                const postNewPersonXhr = xhrs[0];
                const getUpdatedProductXhr = xhrs[1];

                expect('@getUpdatedProduct status: ' + getUpdatedProductXhr?.status)
                    .to.equal('@getUpdatedProduct status: ' + 200);
                expect('@postNewPerson status: ' + postNewPersonXhr.status)
                    .to.equal('@postNewPerson status: ' + 200);
                const personData = postNewPersonXhr.response.body || {};
                expect(personData.name).to.equal(assignedPerson.name);
                expect(personData.newPerson).to.equal(assignedPerson.isNew);
                expect(personData.notes).to.equal(assignedPerson.notes);
                expect(personData.spaceRole.name).to.equal(assignedPerson.role);
            }).then(() => {
                cy.get(`[data-testid=productCardContainer__my_product]`)
                    .find(`[data-testid=assignmentCard__person_name]`)
                    .should('contain', assignedPerson.name)
                    .should('contain', assignedPerson.role)
                    .then(() => {
                        if (person.isNew) {
                            cy.get(`[data-testid=assignmentCard__person_name]`)
                                .find('[data-testid=newBadge]')
                                .should('be.visible');
                        }
                    });

                ensureNewAssignmentIsPresentInReassignmentDrawer(assignedPerson);

                getCalendarToggle().click();
                cy.getCalendarDate(notActiveDateString).should('have.class', highlightClass).click();
            });
    });

    it('Add an existing person to a product', () => {
        cy.get('[data-testid="addPersonToProductIcon__my_product"]').click();
        cy.getModal().contains('Assign a Person').should('exist');

        cy.log('**Form should be pre-populated with desired product name**');
        cy.getModal().contains('My Product').should('exist');

        const existingPersonName = 'Adam Sandler';
        cy.getModal().find('[id=person]')
            .type(`${existingPersonName}{enter}`, { force: true })

        cy.getModal().contains(existingPersonName).should('exist');

        cy.route('POST', '**/assignment/create').as('postReassignPerson');

        cy.getModal().contains('[data-testid="assignButton"]', 'Assign').click();

        cy.wait(['@postReassignPerson', '@getProductsByDate', '@getPeople']);

        cy.get('[data-testid="productCardContainer__my_product"]')
            .should('contain', existingPersonName);
    });
    
    it('Create a new unassigned person', () => {
        cy.clock().then((clock) => {
            clock.restore()
        })
        cy.spyOnGetProductsByDate(new Date().toString());
        cy.visitSpace();

        const unassignedPerson = {
            ...person,
            assignTo: '',
            notes: '',
            isNew: false,
            tags: ['Tag 1'],
        };

        cy.contains(unassignedPerson.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Add New Person');

        populatePersonForm(unassignedPerson);

        submitPersonForm('Add');

        cy.wait(['@postNewPerson', '@getProductsByDate', '@getPeople'])
            .should((xhrs: Cypress.ObjectLike[]) => {
                const postNewPersonXhr = xhrs[0];
                const getUpdatedProductXhr = xhrs[1];

                expect('@getUpdatedProduct status: ' + getUpdatedProductXhr?.status)
                    .to.equal('@getUpdatedProduct status: ' + 200);
                expect('@postNewPerson status: ' + postNewPersonXhr.status)
                    .to.equal('@postNewPerson status: ' + 200);
                const personData = postNewPersonXhr.response.body || {};
                expect(personData.name).to.equal(unassignedPerson.name);
                expect(personData.newPerson).to.equal(unassignedPerson.isNew);
                expect(personData.notes).to.equal(unassignedPerson.notes);
                expect(personData.spaceRole.name).to.equal(unassignedPerson.role);
                personData.tags.forEach(tag => {
                    expect(unassignedPerson.tags).to.contain(tag.name);
                });
            }).then(() => {
                cy.get('[data-testid=unassignedPeopleContainer]')
                    .find(`[data-testid=assignmentCard__person_name]`)
                    .should('contain', unassignedPerson.name)
                    .should('contain', unassignedPerson.role)
                    .then(() => {
                        if (unassignedPerson.isNew) {
                            cy.get(`[data-testid=assignmentCard__person_name]`)
                                .find('[data-testid=newBadge]')
                                .should('be.visible');
                        }
                    });

                cy.get('[data-testid=reassignmentDrawer]')
                    .should('contain', 'Reassigned')
                    .find('[data-testid=reassignmentDrawerCountBadge]').should('have.text', '1');

                ensureUnassignedPersonIsPresentInUnassignedDrawer(unassignedPerson);
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
            tags: ['Tag 1'],
        };
        cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
        cy.get('[data-testid=editMenuOption__edit_person]').click();
        populatePersonForm(editedPerson);
        submitPersonForm('Save');

        cy.wait('@updatePerson')
            .should((xhr: Cypress.ObjectLike) => {
                const personData = xhr.response.body || {};
                expect('@updatedPersonXHR status: ' + xhr?.status).to.equal('@updatedPersonXHR status: ' + 200);
                expect(personData.name).to.equal(editedPerson.name);
                expect(personData.newPerson).to.equal(editedPerson.isNew);
                expect(personData.notes).to.equal(editedPerson.notes);
                expect(personData.spaceRole.name).to.equal(editedPerson.role);
                personData.tags.forEach(tag => {
                    expect(editedPerson.tags).to.contain(tag.name);
                });
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
            .should((xhr: Cypress.ObjectLike) => {
                expect(xhr?.status).to.equal(200);
            });
        cy.get('[data-testid=editPersonIconContainer__jane_smith]').should('not.exist');
    });

    context('Drag and Drop', () => {
        it('Drag and drop person from one product to another product and back', () => {
            const assignmentName = 'Jane Smith';
            const janeSmithSelector = '[data-testid=assignmentCard__jane_smith]';

            checkIfPersonIsInProductBaguetteBakery(assignmentName, false);
            checkIfPersonIsInProductMyProduct(assignmentName, true);

            moveAssignment(janeSmithSelector, keycodes.arrowLeft);

            cy.wait('@getProductsByDate').should(() => {
                checkIfPersonIsInProductBaguetteBakery(assignmentName, true);
                checkIfPersonIsInProductMyProduct(assignmentName, false);
            });

            moveAssignment(janeSmithSelector, keycodes.arrowRight);

            cy.wait('@getProductsByDate').should(() => {
                checkIfPersonIsInProductBaguetteBakery(assignmentName, false);
                checkIfPersonIsInProductMyProduct(assignmentName, true);
            });
        });

        it('Drag and drop person from a product to unassigned and back', () => {
            const assignmentName = 'Adam Sandler';
            const adamSandlerSelector = '[data-testid="assignmentCard__adam_sandler"]';

            cy.get('[data-testid=unassignedDrawer]').click();

            checkIfPersonIsInUnassignedDrawer(assignmentName, true);
            checkIfPersonIsInProductMyProduct(assignmentName, false);

            moveAssignment(adamSandlerSelector, keycodes.arrowLeft);

            cy.wait('@getProductsByDate').should(() => {
                checkIfPersonIsInUnassignedDrawer(assignmentName, false);
                checkIfPersonIsInProductMyProduct(assignmentName, true);
            });

            moveAssignment(adamSandlerSelector, keycodes.arrowRight);

            cy.wait('@getProductsByDate').should(() => {
                checkIfPersonIsInUnassignedDrawer(assignmentName, true);
                checkIfPersonIsInProductMyProduct(assignmentName, false);
            });
        });
    });

    context('Edit Menu', () => {
        beforeEach(() => {
            cy.clock().then((clock) => {
                clock.restore()
            })
            cy.visitSpace();
        })

        it('Only allow one person\'s edit menu to be open at a time', () => {
            cy.get('[data-testid=editMenu__jane_smith]').should('not.exist');
            cy.get('[data-testid=editMenu__bob_barker]').should('not.exist');

            cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
            cy.get('[data-testid=editMenu__jane_smith]').should('exist');

            cy.get('[data-testid=editPersonIconContainer__bob_barker]').click();
            cy.get('[data-testid=editMenu__jane_smith]').should('not.exist');
            cy.get('[data-testid=editMenu__bob_barker]').should('exist');
        });

        it('Make and unmark a person as a placeholder', () => {
            cy.get('[data-testid=assignmentCard__jane_smith]').should('not.have.class', 'placeholder');

            cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
            cy.contains('Mark as Placeholder').click();

            cy.get('[data-testid=assignmentCard__jane_smith]').should('have.class', 'placeholder');

            cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
            cy.contains('Unmark as Placeholder').click();

            cy.get('[data-testid=assignmentCard__jane_smith]').should('not.have.class', 'placeholder');
        });
    });
});

const populatePersonForm = ({ name, isNew = false, role, assignTo, notes, tags = [] }): void => {
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
        .type(role + '{enter}', {force: true});
    
    cy.wait('@postNewRole');

    if (isNew && assignTo) {
        cy.get('@personForm')
            .find('.product__value-container input')
            .focus()
            .type(assignTo + '{enter}', {force: true});
    }

    tags.forEach((tag) => {
        cy.get('@personForm')
            .find('[id=personTags]')
            .focus()
            .type(tag + '{enter}', {force: true});
    });

    if (notes) {
        cy.get('[data-testid=formNotesToField]').focus().type(notes).should('have.value', notes);
    }
};

const submitPersonForm = (expectedSubmitButtonText: string): void => {
    cy.get('[data-testid=personFormSubmitButton]').should('have.text', expectedSubmitButtonText).click();
    cy.get('@personForm').should('not.exist');
};

const ensureNewAssignmentIsPresentInReassignmentDrawer = (assignedPerson: Person): void => {
    cy.get('@reassignmentDrawer')
        .find('[data-testid=reassignmentContainer] [data-testid=reassignmentSection]')
        .should('have.length', 1)
        .eq(0)
        .should('contain', assignedPerson.name)
        .should('contain', assignedPerson.role)
        .should('contain', `Assigned to ${assignedPerson.assignTo}`);
};

const ensureUnassignedPersonIsPresentInUnassignedDrawer = (unassignedPerson: Person): void => {
    cy.get('[data-testid=unassignedDrawer]').as('unassignedDrawer');
    cy.get('@unassignedDrawer')
        .should('contain', 'Unassigned')
        .find('[data-testid=unassignedDrawerCountBadge]').should('have.text', '2');

    cy.get('@unassignedDrawer')
        .find('[data-testid=unassignedPeopleContainer] [data-testid=assignmentCard__person_name]')
        .should('contain', unassignedPerson.name)
        .should('contain', unassignedPerson.role);
};

function checkIfPersonIsInUnassignedDrawer(name: string, isPresent = false) {
    const shouldAssertion = isPresent ? 'contain' : 'not.contain';
    cy.get('[data-testid=productDrawerContainer__unassigned]').should(shouldAssertion, name);
}

function checkIfPersonIsInProductBaguetteBakery(name: string, isPresent = false) {
    const shouldAssertion = isPresent ? 'contain' : 'not.contain';
    cy.get('[data-testid=productCardContainer__baguette_bakery]').should(shouldAssertion, name);
}

function checkIfPersonIsInProductMyProduct(name: string, isPresent = false) {
    const shouldAssertion = isPresent ? 'contain' : 'not.contain';
    cy.get('[data-testid=productCardContainer__my_product]').should(shouldAssertion, name);
}

function moveAssignment(selector: string, direction: typeof keycodes.arrowLeft | typeof  keycodes.arrowLeft) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(selector)
        .trigger('keydown', { keyCode: keycodes.space })
        .trigger('keydown', { keyCode: direction, force: true })
        .wait(200)
        .trigger('keydown', { keyCode: keycodes.space, force: true });
}

function getCalendarToggle() {
    return cy.get('[data-testid=calendarToggle]')
}