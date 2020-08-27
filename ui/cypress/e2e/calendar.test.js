/// <reference types="Cypress" />

import '../support/commands';
import product from "../fixtures/product";
const spaceId = Cypress.env('SPACE_ID');

describe('Calendar', () => {
    beforeEach(() => {
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

        const currentDate = Cypress.moment();
        const dateWithChanges = () => {
            const startOfMonth = Cypress.moment().startOf('month').day(3);
            if (currentDate.isSame(startOfMonth, 'date')) {
                startOfMonth.day(4);
            }
            return startOfMonth;
        };

        // eslint-disable-next-line no-undef
        addProduct(product);

    });
});
