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

describe('Account Dropdown', () => {
    beforeEach(() => {
        cy.visitBoard();
    });

    context('Share Access', () => {
        it('Add people to a space should fail is email address is not properly formatted', () => {
            cy.get('[data-testid=accountDropdownToggle]').click();
            cy.get('[data-testid=shareAccess]').click();
            cy.get('[data-testid=inviteEditorsFormEmailTextarea]').focus().type('aaaaaa');
            cy.get('.primaryButton').should('be.disabled');
        });

        it('Add people to a space should show link to space url', () => {
            cy.server();
            cy.route('PUT', Cypress.env('API_INVITE_PEOPLE_PATH')).as('putAddPersonToSpace');
            const spaceUuid = Cypress.env('SPACE_UUID');
            const baseUrl = Cypress.config().baseUrl;

            cy.get('[data-testid=accountDropdownToggle]').click();
            cy.get('[data-testid=shareAccess]').click();
            cy.get('[data-testid=inviteEditorsFormEmailTextarea]').focus().type('Elise@grif.com');
            cy.get('[data-testid=inviteEditorsFormSubmitButton]').should('not.be.disabled').click();

            cy.wait('@putAddPersonToSpace')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
                });

            cy.get('[data-testid=grantEditAccessConfirmationFormLinkToSpace]')
                .should('contain', baseUrl + '/' + spaceUuid);
            cy.get('[data-testid=grantEditAccessConfirmationFormCopyButton]')
                .should('contain', 'Copy link' )
                .click()
                .should('contain', 'Copied' );
            cy.get('[data-testid=grantEditAccessConfirmationFormDoneButton]').click();
            cy.get('[data-testid=modalPopupContainer]').should('not.be.visible');
        });

        // @todo comment back in once view only toggle is visible in the app
        xit('Toggle public ability to see today\'s view should update the space in the API', () => {
            cy.get('[data-testid=accountDropdownToggle]').click();
            cy.get('[data-testid=shareAccess]').click();
            cy.get('[data-testid=viewOnlyAccessToggle]').as('toggleReadOnlySwitch');
            cy.get('@toggleReadOnlySwitch')
                .should('not.be.checked')
                .siblings('.react-switch-bg').click();
            cy.get('@toggleReadOnlySwitch')
                .should('be.checked');
        });
    });
});
