/// <reference types="Cypress" />

describe('Calendar', () => {
    it('Calendar should show current month and day', () => {
        cy.get('[data-cy=calendarToggle]').as('calendarToggle');
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
});