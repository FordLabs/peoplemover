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
const newSpaceName = 'SpaceShip';
const flippingSweetSpaceName = 'Flipping Sweet'

describe('The Space Dashboard', () => {
    beforeEach(() => {
        cy.intercept('GET', '/api/spaces/user').as('getSpacesForUser');

        cy.visit('/user/dashboard');

        cy.wait('@getSpacesForUser');

        cy.get('[data-testid="spaceDashboardTile"]').as('spaceTiles');

        cy.get('@spaceTiles')
            .should('have.length', 1)
            .should('contain', flippingSweetSpaceName);
        cy.get('[data-testid=peopleMoverHeader]')
            .should('contain', 'PEOPLEMOVER')
            .should('not.contain', flippingSweetSpaceName)
    })

    it('Add a space', () => {
        cy.contains('Create New Space').click();
        cy.get('[data-testid="createSpaceInputField"]').type(newSpaceName);
        cy.get('[data-testid="createSpaceButton"]').should('contain', 'Create').click();

        cy.get('[data-testid=peopleMoverHeader]').should('contain', newSpaceName)
        cy.contains('Add Product').should('exist');
    });

    it('Edit a space name', () => {
        openSpaceActionsDropdown(flippingSweetSpaceName);
        cy.contains('Edit').click();
        cy.get('[data-testid="createSpaceInputField"]').type(' SpaceShip');
        cy.findByText('Save').click();

        cy.wait(['@getSpacesForUser']);

        cy.get('@spaceTiles')
            .should('have.length', 1)
            .should('contain', 'Flipping Sweet SpaceShip');
    });

    it('Delete a space', () => {
        openDeleteSpaceModal(flippingSweetSpaceName);
        cy.contains('Are you sure?').should('exist');
        cy.contains('Transfer Ownership').should('exist');
        cy.get('[data-testid="confirmationModalLeaveAndDeleteSpace"]').click();

        cy.wait(['@getSpacesForUser']);

        checkPresenceOfDashboardWelcomeMessage(true);
        cy.contains(flippingSweetSpaceName).should('not.exist');
    });

    it('Leave a space (transfer ownership of a space)', () => {
        checkPresenceOfDashboardWelcomeMessage(false);

        openSpaceActionsDropdown(flippingSweetSpaceName);
        cy.contains('Leave Space').click();
        cy.contains('Transfer Ownership of Space');
        cy.get('[data-testid="transferOwnershipFormRadioControl-BBARKER"]').click();
        cy.get('[data-testid="transferOwnershipFormSubmitButton"]').click();
        cy.contains('Confirmed').should('exist');
        cy.get('[data-testid="confirmationModalCancel"]').click({ force: true });

        cy.wait(['@getSpacesForUser']);

        checkPresenceOfDashboardWelcomeMessage(true);
    });

    it('Only show "Sign Out" option in account dropdown', () => {
        cy.get('[data-testid="currentUserMessage"]')
            .should('have.text', 'Welcome, USER_ID')
            .click();
        cy.findByText('Sign Out').should('exist');
        cy.findByText('Share Access').should('not.exist');
        cy.findByText('Download Report').should('not.exist');
    });
});

function checkPresenceOfDashboardWelcomeMessage(isPresent : boolean) {
    const isPresentAssertion = isPresent ? 'exist' : 'not.exist';
    cy.contains('Welcome to PeopleMover!').should(isPresentAssertion);
    cy.contains('Get started by creating your own space.').should(isPresentAssertion);
    cy.contains('Create New Space').should('exist');
}

function openSpaceActionsDropdown(spaceName: string) {
    cy.findByLabelText(`Open Menu for Space ${spaceName}`).click();
}

function openDeleteSpaceModal(spaceName: string) {
    openSpaceActionsDropdown(spaceName);
    cy.contains('Delete Space').click();
}