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
import person, {Person} from '../fixtures/person';
const todaysDate = moment().format('yyyy-MM-DD');

describe('People', () => {
    let notTodaysDate;
    let highlightedLastDayOfMonth;
    let calendarDateClass;

    beforeEach(() => {
        cy.visitSpace();
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');

        notTodaysDate = findAWorkingDayThatIsNotTodayInTheMiddleOfTheMonth();

        calendarDateClass = `.react-datepicker__day--0${moment(notTodaysDate).format('DD')}`;
        highlightedLastDayOfMonth = `${calendarDateClass}.react-datepicker__day--highlighted`;
    });

    it('Add a new assigned person', () => {
        cy.get('[data-testid=calendarToggle]').as('calendarToggle');

        cy.route('POST', Cypress.env('API_PERSON_PATH')).as('postNewPerson');
        cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${notTodaysDate}`).as('getUpdatedProduct');
        cy.route('GET', Cypress.env('API_PERSON_PATH')).as('getPeople');

        cy.get('@calendarToggle').click();
        cy.get(calendarDateClass).click();
        cy.get(highlightedLastDayOfMonth).should('not.exist');

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

        cy.wait(['@postNewPerson', '@getUpdatedProduct', '@getPeople'])
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
                cy.get(`[data-testid=assignmentCard__person_name]`)
                    .should('contain', assignedPerson.name)
                    .should('contain', assignedPerson.role)
                    .then(() => {
                        if (person.isNew) {
                            cy.get(`[data-testid=assignmentCard__person_name]`)
                                .find('[data-testid=newBadge]')
                                .should('be.visible');
                        }
                    });

                ensureNewAssignmentIsPresentInAssignmentDrawer(assignedPerson);

                cy.get('@calendarToggle').click();
                cy.get(highlightedLastDayOfMonth).should('have.text', moment(notTodaysDate).format('D'));
            });
    });
    
    it('Add a new unassigned person', () => {
        cy.route('POST', Cypress.env('API_PERSON_PATH')).as('postNewPerson');
        cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${todaysDate}`).as('getUpdatedProduct');
        cy.route('GET', Cypress.env('API_PERSON_PATH')).as('getPeople');

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

        cy.wait(['@postNewPerson', '@getUpdatedProduct', '@getPeople'])
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
                cy.get(`[data-testid=assignmentCard__person_name]`)
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
        beforeEach(() => {
            cy.route('GET', Cypress.env('API_PRODUCTS_PATH') + '?requestedDate=' + todaysDate).as('getProducts');
        });

        it('Drag and drop person from one product to another product', () => {
            ensureJaneSmithDoesNotExistOnSelector('[data-testid=productCardContainer__baguette_bakery]');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                moveElement(element, '[data-testid=assignmentCard__jane_smith]');

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Jane Smith');
                });
            });
        });

        it('Drag and drop person from a product to unassigned', () => {
            cy.get('[data-testid=unassignedDrawer]').click();

            ensureJaneSmithDoesNotExistOnSelector('[data-testid=productDrawerContainer__unassigned]');

            cy.get('[data-testid=productDrawerContainer__unassigned]').then(element => {
                moveElement(element, '[data-testid=assignmentCard__jane_smith]');

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productDrawerContainer__unassigned]').contains('Jane Smith');
                });
            });
        });

        it('Drag and drop person from a unassigned to a product', () => {
            cy.get('[data-testid=unassignedDrawer]').click();

            cy.get('[data-testid=productCardContainer__baguette_bakery]')
                .contains('Adam Sandler')
                .should('not.exist');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                moveElement(element, '[data-testid=assignmentCard__adam_sandler]');

                cy.wait('@getProducts').should(() => {
                    cy.get('[data-testid=productCardContainer__baguette_bakery]').contains('Adam Sandler');
                });
            });
        });
    });

    context('Edit Menu', () => {
        it('Only allow one person\'s edit menu to be open at a time', () => {
            cy.get('[data-testid=editMenu__jane_smith]').should('not.exist');
            cy.get('[data-testid=editMenu__bob_barker]').should('not.exist');

            cy.get('[data-testid=editPersonIconContainer__jane_smith]').click();
            cy.get('[data-testid=editMenu__jane_smith]').should('exist');

            cy.get('[data-testid=editPersonIconContainer__bob_barker]').click();
            cy.get('[data-testid=editMenu__jane_smith]').should('not.exist');
            cy.get('[data-testid=editMenu__bob_barker]').should('exist');
        });
    });
});

function findAWorkingDayThatIsNotTodayInTheMiddleOfTheMonth(): string {
    let closestWorkdayToMiddleOfMonthThatIsntToday;
    const firstDayOfMonth = moment().startOf('month');
    const twoWeeksIntoMonth = firstDayOfMonth.add(2, 'weeks');
    const closestWorkdayToMiddleOfMonth = twoWeeksIntoMonth.isoWeekday() <= 5 ? twoWeeksIntoMonth : twoWeeksIntoMonth.add(8 - twoWeeksIntoMonth.isoWeekday(), 'days');
    if (todaysDate === closestWorkdayToMiddleOfMonth.format('yyyy-MM-DD')) {
        if (closestWorkdayToMiddleOfMonth.isoWeek() === 5) {
            closestWorkdayToMiddleOfMonthThatIsntToday = closestWorkdayToMiddleOfMonth.subtract(1, 'days').format('yyyy-MM-DD');
        } else {
            closestWorkdayToMiddleOfMonthThatIsntToday = closestWorkdayToMiddleOfMonth.add(1, 'days').format('yyyy-MM-DD');
        }
    } else {
        closestWorkdayToMiddleOfMonthThatIsntToday = closestWorkdayToMiddleOfMonth.format('yyyy-MM-DD');
    }
    return closestWorkdayToMiddleOfMonthThatIsntToday;
}

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

const ensureNewAssignmentIsPresentInAssignmentDrawer = (assignedPerson: Person): void => {
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

function ensureJaneSmithDoesNotExistOnSelector(selector: string): void {
    cy.get(selector)
        .contains('Jane Smith')
        .should('not.exist');
}

function moveElement(element, itemSelectorToMove: string) {
    const rect = element[0].getBoundingClientRect();
    cy.get(itemSelectorToMove)
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
}