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

describe('The Space Dashboard', () => {
    beforeEach(() => {
        cy.intercept('GET', Cypress.env('API_USERS_PATH')).as('getSpaceUsers');
        cy.visit('/user/dashboard');

        cy.wait('@getSpaceUsers');

        cy.get('[data-testid="spaceDashboardTile"]')
            .should('have.length', 1)
            .should('contain', 'Flipping Sweet');
    })

    // it('Delete a space', () => {});

    // it('Add a space', () => {});

    // it('Edit a space', () => {});

    it('Transfer ownership of a space', () => {
        checkPresenceOfDashboardWelcomeMessage(false);

        cy.get('[data-testid="ellipsisButton"]').click();
        cy.contains('Leave Space').click();
        cy.contains('Transfer Ownership of Space');
        cy.get('[data-testid="transferOwnershipFormRadioControl-BBARKER"]').click();
        cy.get('[data-testid="transferOwnershipFormSubmitButton"]').click();
        cy.contains('Confirmed').should('exist');
        cy.get('[data-testid="confirmationModalCancel"]').click({ force: true });

        checkPresenceOfDashboardWelcomeMessage(true);
    });

    // it('Leave a space ', () => {});

    // it('Show no spaces message', () => {});

    xit('refreshes page after deleting a space', () => {
        cy.intercept('GET', Cypress.env('API_USERS_PATH')).as('getSpaceUsers');
        cy.visit('/user/dashboard');
        cy.injectAxe();
        cy.get('.createNewSpaceButton').click();
        cy.get('[data-testid=createSpaceInputField]').type('abc');
        cy.get('[data-testid=createSpaceButton]').click();
        cy.contains('Unassigned');
        cy.contains('PEOPLEMOVER').click();
        cy.get('[data-testid=spaceDashboardTile]')
            .should('contain.text', 'abc');
        cy.contains('abc');
        cy.wait('@getSpaceUsers');
        cy.wait('@getSpaceUsers');
        cy.wait('@getSpaceUsers');
        cy.get('[id=ellipsis-button-abc]').click();
        cy.contains('Leave Space').click();
        cy.contains('Leave & delete').click();
        cy.get('[data-testid=spaceDashboardTile]')
            .should('not.contain.text', 'abc');
    });
});

function checkPresenceOfDashboardWelcomeMessage(isPresent : boolean) {
    const isPresentAssertion = isPresent ? 'exist' : 'not.exist';
    cy.contains('Welcome to PeopleMover!').should(isPresentAssertion);
    cy.contains('Get started by creating your own space.').should(isPresentAssertion);
    cy.contains('Create New Space').should('exist');
}