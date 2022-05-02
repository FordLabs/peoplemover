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

/// <reference types="Cypress" />
import moment from 'moment';

describe('Calendar', () => {
    beforeEach(() => {
        cy.visitSpace();

        cy.get('[data-testid=calendarToggle]').as('calendarToggle');
    });

    it('Calendar should show current month and day', () => {
        const expectedCurrentDate = moment().format('MMM D, YYYY');
        cy.get('.calendarLabel').should('contain', 'Viewing:');
        cy.get('@calendarToggle')
            .should('contain', expectedCurrentDate);

        cy.log('Open calendar');
        cy.get('@calendarToggle').click();

        const expectedCurrentMonth = moment().format('MMMM YYYY');
        cy.get('.monthText').should('have.text', expectedCurrentMonth);

        const expectedCurrentDay = moment().format('D');
        cy.get('.react-datepicker__day--today').should('have.text', expectedCurrentDay);

        cy.log('Close calendar');
        cy.get('@calendarToggle').click();
    });

    it('Calendar should show highlighted days when changes are made on that day', () => {
        cy.get('[data-testid=reassignmentDrawer]').should('contain', 'Bob Barker');

        cy.log('Open calendar');
        cy.get('@calendarToggle').click();

        const expectedCurrentDay = moment().format('D');
        cy.get('.react-datepicker__day--highlighted').should('have.text', expectedCurrentDay);
    });
});
