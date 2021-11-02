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

describe('The Space Dashboard', () => {
    it('can open the Invite Editors modal from the Space Dashboard', () => {
        cy.visit('/user/dashboard');
        cy.injectAxe();
        cy.get('[data-testid=spaceDashboardTile]')
            .should('contain.text', 'Flipping Sweet');
        cy.get('[data-testid=ellipsisButton]').click();
        cy.contains('Leave Space').click();
        cy.contains('Assign a new owner').click();
        cy.contains('Invite others to edit');
    });

    it('refreshes page after deleting a space', () => {
        cy.visit('/user/dashboard');
        cy.injectAxe();
        cy.get('.createNewSpaceButton').click();
        cy.get('[data-testid=createSpaceInputField]').type('abc');
        cy.get('[data-testid=createSpaceButton]').click();
        cy.contains('Unassigned');
        cy.contains('PEOPLEMOVER').click();
        cy.get('[data-testid=spaceDashboardTile]')
            .should('contain.text', 'abc');
        cy.get('#ellipsis-button-abc').first().click();
        cy.contains('Leave Space').click();
        cy.contains('Leave & delete').click();
        cy.get('[data-testid=spaceDashboardTile]')
            .should('not.contain.text', 'abc');
    });
});
