/*
 * Copyright (c) 2021 Ford Motor Company
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

/// <reference types="Cypress" />

import '../support/commands';

describe('Calendar', () => {
    beforeEach(() => {
        cy.visitBoard();

        cy.get('[data-testid=calendarToggle]').as('calendarToggle');
    });

    it('Calendar should show current month and day', () => {
        const expectedCurrentDate = Cypress.moment().format('MMMM D, YYYY');
        cy.get('@calendarToggle')
            .should('contain', 'Viewing:')
            .should('contain', expectedCurrentDate);

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
        cy.get('[data-testid=reassignmentDrawer]').should('contain', 'Bob Barker');

        cy.log('Open calendar');
        cy.get('@calendarToggle').click();

        const expectedCurrentDay = Cypress.moment().format('D');
        cy.get('.react-datepicker__day--highlighted').should('have.text', expectedCurrentDay);
    });
});
