/// <reference types="Cypress" />

import '../support/commands';
import product from "../fixtures/product";
const spaceId = Cypress.env('SPACE_ID');

describe('Calendar', () => {
    beforeEach(() => {
        // cy.resetPerson();
        // cy.resetProduct();
        cy.visitBoard();
    });

    it('Calendar should show current month and day', () => {
        cy.get('[data-testid=calendarToggle]').as('calendarToggle');
        const expectedCurrentDate = Cypress.moment().format('MMMM D, YYYY');
        cy.get('@calendarToggle').should('contain', expectedCurrentDate);

        cy.log('Open calendar');
        cy.get('@calendarToggle').click();

        const expectedCurrentMonth = Cypress.moment().format('MMMM');
        cy.get('.monthText').should('have.text', expectedCurrentMonth);

        const expectedCurrentDay = Cypress.moment().format('D');
        cy.get('.react-datepicker__day--today').should('have.text', expectedCurrentDay);

        cy.log('Close calendar');
        cy.get('@calendarToggle').click();
    });

    it('Calendar should show highlighted days when changes are made on that day', () => {
        cy.get('[data-testid=calendarToggle]').as('calendarToggle');
        const expectedCurrentDate = Cypress.moment().format('MMMM D, YYYY');
        cy.get('@calendarToggle').should('contain', expectedCurrentDate);
        cy.log('Open calendar');
        cy.get('@calendarToggle').click();

        const productToAdd = {
            name: 'Automated Test Product',
            startDate: Cypress.moment().format('YYYY-MM-DD'),
            endDate: Cypress.moment().add(1, 'days').format('YYYY-MM-DD'),
            dorfCode: '',
            archived: false,
            spaceId: spaceId,
            notes: 'These are some VERY interesting product notes. You\'re welcome.',
        };

        cy.addProduct(productToAdd);

        const personToAdd = {
            name: 'Name2',
            isNew: true,
            role: 'Product Owner',
            assignTo: 'My Product',
            notes: 'Here is a thought you might want to remember.',
        };

        cy.addPerson(personToAdd);

        const productPlaceholderPair = {
            productId: product.id,
            boolean: false,
        };

        let setOfProductPlaceholders = new Set();
        setOfProductPlaceholders.add(productPlaceholderPair);

        const assignmentToAdd = {
            requestedDate: Cypress.moment().format('YYYY-MM-DD'),
            person: personToAdd,
            products: setOfProductPlaceholders,
        };

        cy.addAssignment(assignmentToAdd);

        cy.log('Open calendar');
        cy.get('@calendarToggle').click();


    });
});
