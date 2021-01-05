/// <reference types="Cypress" />
import person from '../fixtures/person';
const todaysDate = Cypress.moment().format('yyyy-MM-DD');

describe('People', () => {
    let notTodaysDate;
    let highlightedLastDayOfMonth;
    let calendarDateClass;

    beforeEach(() => {
        cy.visitBoard();
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');

        notTodaysDate = findAWorkingDayThatIsNotTodayInTheMiddleOfTheMonth();

        calendarDateClass = `.react-datepicker__day--0${Cypress.moment(notTodaysDate).format('DD')}`;
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
            .find('[data-testid=countBadge]').should('not.exist');

        const assignedPerson = {...person};

        cy.contains(assignedPerson.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Add New Person');

        populatePersonForm(assignedPerson);

        submitPersonForm('Add');

        cy.wait(['@postNewPerson', '@getUpdatedProduct', '@getPeople'])
            .should((xhrs) => {
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
                cy.get(highlightedLastDayOfMonth).should('have.text', Cypress.moment(notTodaysDate).format('D'));
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
        };

        cy.contains(unassignedPerson.name).should('not.exist');

        cy.get('[data-testid=addPersonButton]').click();

        cy.getModal().should('contain', 'Add New Person');

        populatePersonForm(unassignedPerson);

        submitPersonForm('Add');

        cy.wait(['@postNewPerson', '@getUpdatedProduct', '@getPeople'])
            .should((xhrs) => {
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
                    .find('[data-testid=countBadge]').should('have.text', '1');

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
        beforeEach(() => {
            cy.route('GET', Cypress.env('API_PRODUCTS_PATH') + '?requestedDate=' + todaysDate).as('getProducts');
        });

        it('Drag and drop person from one product to another product', () => {
            cy.get('[data-testid=productCardContainer__baguette_bakery]')
                .contains('Jane Smith')
                .should('not.exist');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid=assignmentCard__jane_smith]')
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

            cy.get('[data-testid=productDrawerContainer__unassigned]')
                .contains('Jane Smith')
                .should('not.exist');

            cy.get('[data-testid=productDrawerContainer__unassigned]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid=assignmentCard__jane_smith]')
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

            cy.get('[data-testid=productCardContainer__baguette_bakery]')
                .contains('Adam Sandler')
                .should('not.exist');

            cy.get('[data-testid=productCardContainer__baguette_bakery]').then(element => {
                let rect = element[0].getBoundingClientRect();
                cy.get('[data-testid=assignmentCard__adam_sandler]')
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function findAWorkingDayThatIsNotTodayInTheMiddleOfTheMonth() {
    let closestWorkdayToMiddleOfMonthThatIsntToday;
    const firstDayOfMonth = Cypress.moment().startOf('month');
    const twoWeeksIntoMonth = firstDayOfMonth.add(2, 'weeks');
    const closestWorkdayToMiddleOfMonth = twoWeeksIntoMonth.isoWeekday() <= 5 ? twoWeeksIntoMonth : twoWeeksIntoMonth.add(8 - twoWeeksIntoMonth.isoWeekday(), 'days');
    if (todaysDate === closestWorkdayToMiddleOfMonth) {
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

    if (isNew && assignTo) {
        cy.get('@personForm')
            .find('.MultiSelect__value-container input')
            .focus()
            .type(assignTo + '{enter}');
    }

    if (notes) {
        cy.get('[data-testid=formNotesToField]').clear().type(notes).should('have.value', notes);
    }
};

const submitPersonForm = (expectedSubmitButtonText) => {
    cy.get('[data-testid=personFormSubmitButton]').should('have.text', expectedSubmitButtonText).click();
    cy.get('@personForm').should('not.be.visible');
};

const ensureNewAssignmentIsPresentInAssignmentDrawer = (assignedPerson) => {
    cy.get('@reassignmentDrawer')
        .find('[data-testid=reassignmentContainer] [data-testid=reassignmentSection]')
        .should('have.length', 1)
        .eq(0)
        .should('contain', assignedPerson.name)
        .should('contain', assignedPerson.role)
        .should('contain', `Assigned to ${assignedPerson.assignTo}`);
};

const ensureUnassignedPersonIsPresentInUnassignedDrawer = (unassignedPerson) => {
    cy.get('[data-testid=unassignedDrawer]').as('unassignedDrawer');
    cy.get('@unassignedDrawer')
        .should('contain', 'Unassigned')
        .find('[data-testid=countBadge]').should('have.text', '2');

    cy.get('@unassignedDrawer')
        .find('[data-testid=unassignedPeopleContainer] [data-testid=assignmentCard__person_name]')
        .should('contain', unassignedPerson.name)
        .should('contain', unassignedPerson.role);
};
