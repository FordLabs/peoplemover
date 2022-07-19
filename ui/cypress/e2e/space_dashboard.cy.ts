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
    const newSpaceName = 'SpaceShip';

    beforeEach(() => {
        cy.intercept('GET', Cypress.env('API_USERS_PATH')).as('getSpaceUsers');

        cy.visit('/user/dashboard');

        cy.wait('@getSpaceUsers');

        cy.get('[data-testid="spaceDashboardTile"]').as('spaceTiles');

        cy.get('@spaceTiles').then((elements) => {
            if (elements.length > 1) {
                openDeleteSpaceModal(newSpaceName);
                cy.get('[data-testid="confirmDeleteButton"]').click();
                cy.contains('Ok').click({ force: true });
            }
        })

        cy.get('@spaceTiles')
            .should('have.length', 1)
            .should('contain', 'Flipping Sweet');
        cy.get('[data-testid=peopleMoverHeader]')
            .should('not.contain', 'Flipping Sweet')
    })


    it('Add a space', () => {
        cy.contains('Create New Space').click();
        cy.get('[data-testid="createSpaceInputField"]').type(newSpaceName);
        cy.get('[data-testid="createSpaceButton"]').should('contain', 'Create').click();

        cy.get('[data-testid=peopleMoverHeader]').should('contain', newSpaceName)
        cy.contains('Add Product').should('exist');
    });

    it('Edit a space name', () => {
        openSpaceActionsDropdown();
        cy.contains('Edit').click();
        cy.get('[data-testid="createSpaceInputField"]').type(' SpaceShip');
        cy.findByText('Save').click();

        cy.get('@spaceTiles')
            .should('have.length', 1)
            .should('contain', 'Flipping Sweet SpaceShip');
    });

    it('Delete a space', () => {
        const flippingSweetBoardName = 'Flipping Sweet'
        openDeleteSpaceModal(flippingSweetBoardName);
        cy.contains('Are you sure?').should('exist');
        cy.contains('Transfer Ownership').should('exist');
        cy.get('[data-testid="confirmationModalLeaveAndDeleteSpace"]').click();
        checkPresenceOfDashboardWelcomeMessage(true);
        cy.contains(flippingSweetBoardName).should('not.exist');
    });

    it('Leave a space (transfer ownership of a space)', () => {
        checkPresenceOfDashboardWelcomeMessage(false);

        openSpaceActionsDropdown();
        cy.contains('Leave Space').click();
        cy.contains('Transfer Ownership of Space');
        cy.get('[data-testid="transferOwnershipFormRadioControl-BBARKER"]').click();
        cy.get('[data-testid="transferOwnershipFormSubmitButton"]').click();
        cy.contains('Confirmed').should('exist');
        cy.get('[data-testid="confirmationModalCancel"]').click({ force: true });

        checkPresenceOfDashboardWelcomeMessage(true);
    });
});

function checkPresenceOfDashboardWelcomeMessage(isPresent : boolean) {
    const isPresentAssertion = isPresent ? 'exist' : 'not.exist';
    cy.contains('Welcome to PeopleMover!').should(isPresentAssertion);
    cy.contains('Get started by creating your own space.').should(isPresentAssertion);
    cy.contains('Create New Space').should('exist');
}

function openSpaceActionsDropdown() {
    cy.get('[data-testid="ellipsisButton"]').click();
}

function openDeleteSpaceModal(spaceName: string) {
    cy.findByLabelText(`Open Menu for Space ${spaceName}`).click();
    cy.contains('Delete Space').click();
}