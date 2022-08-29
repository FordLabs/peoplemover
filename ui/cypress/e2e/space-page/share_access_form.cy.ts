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

describe('Share Access Form', () => {
    beforeEach(() => {
        cy.visitSpace();
        openShareAccessForm();

        cy.get('[data-testid=modalCard]').eq(0)
            .as('inviteToViewModalCard');

        cy.get('[data-testid=modalCard]').eq(1)
            .as('inviteToEditModalCard');
    });

    context('Double modal expansion functionality', () => {
        it('One modal card is expanded at a time when more than one is present', () => {
            inviteToViewModalCardShouldBeExpanded();

            expandInviteToEditModalCard();

            inviteToEditModalCardShouldBeExpanded();

            expandInviteToViewModalCard();

            inviteToViewModalCardShouldBeExpanded();
        });
    });

    context('"Invite others to view" Section', () => {
        it('should toggle the space\'s view-only switch and update the space accordingly', () => {
            cy.get('[data-testid=viewOnlyAccessToggle]').as('toggleReadOnlySwitch');
            cy.get('@toggleReadOnlySwitch')
                .should('not.be.checked')
                .siblings('.react-switch-handle').click();
            cy.get('@toggleReadOnlySwitch')
                .should('be.checked');
        });
    });

    context('"Invite others to edit" Section', () => {
        beforeEach(() => {
            expandInviteToEditModalCard();
        });

        it('Invite editors to a space should show link to space url', () => {
            cy.server();
            cy.route('POST', Cypress.env('API_USERS_PATH')).as('postAddPersonToSpace');
            const spaceUuid = Cypress.env('SPACE_UUID');
            const baseUrl = Cypress.config().baseUrl;

            cy.get('[data-testid=userIdName]').eq(0).should('contain.text', 'USER_ID');

            cy.get('[id=employeeIdTextArea]').focus().type('aaaaaa#', {force: true});
            cy.get('.primaryButton').should('be.disabled');

            cy.get('[id=employeeIdTextArea]').focus().clear().type('Elise', {force: true});
            cy.get('[data-testid=inviteEditorsFormSubmitButton]').should('not.be.disabled').click();

            cy.wait('@postAddPersonToSpace')
                .should((xhr: Cypress.ObjectLike) => {
                    expect(xhr.status).to.equal(200);
                });

            cy.get('[data-testid=grantEditAccessConfirmationFormLinkToSpace]')
                .should('contain', baseUrl + '/' + spaceUuid);
            cy.get('[data-testid=grantEditAccessConfirmationFormCopyButton]')
                .should('contain', 'Copy link' )
                .click()
                .should('contain', 'Copied' );
            cy.get('[data-testid=grantEditAccessConfirmationFormDoneButton]').focus().click();
            cy.get('[data-testid=modalPopupContainer]').should('not.exist');


            openShareAccessForm();
            expandInviteToEditModalCard();

            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'USER_ID')
                .should('contain.text', 'owner');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'ELISE')
                .find(':contains("Editor")').eq(0)
                .click();
            cy.get('[data-testid=userAccessOptionLabel]').eq(2).should('contain.text', 'Remove')
                .click();
            cy.get('[data-testid=confirmDeleteButton]').should('contain.text', 'Yes').click();

            cy.get('[data-testid=userIdName]').should('have.length', 2);
            cy.get('[data-testid=userListItem__ELISE]').should('not.exist');
        });

        it('Transferring ownership', () => {
            cy.server();
            cy.route('POST', Cypress.env('API_USERS_PATH')).as('postAddPersonToSpace');
            cy.route('PUT', `${Cypress.env('API_USERS_PATH')}/ELISE`).as('putChangeOwner');
            cy.route('GET', Cypress.env('API_USERS_PATH')).as('getAllUsers');

            cy.log('**Transferring ownership to an editor should change current owner to editor**');

            cy.get('[id=employeeIdTextArea]').focus().type('Elise', {force: true});
            cy.get('[data-testid=inviteEditorsFormSubmitButton]').should('not.be.disabled').click();

            cy.wait('@postAddPersonToSpace')
                .should((xhr: Cypress.ObjectLike) => {
                    expect(xhr.status).to.equal(200);
                });

            cy.get('[data-testid=grantEditAccessConfirmationFormDoneButton]').click();
            cy.get('[data-testid=modalPopupContainer]').should('not.exist');

            openShareAccessForm();
            expandInviteToEditModalCard();

            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'USER_ID')
                .should('contain.text', 'owner');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'ELISE')
                .find(':contains("Editor")').eq(0)
                .click();

            cy.get('[data-testid=userAccessOptionLabel]').eq(1)
                .should('contain.text', 'Owner')
                .click();

            cy.get('[data-testid=confirmDeleteButton]').should('contain.text', 'Yes').click();

            cy.wait('@putChangeOwner')
                .should((xhr: Cypress.ObjectLike) => {
                    expect(xhr.status).to.equal(200);
                });

            cy.wait('@getAllUsers')
                .should((xhr: Cypress.ObjectLike) => {
                    expect(xhr.status).to.equal(200);
                });

            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'USER_ID');
            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'Editor');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'ELISE');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'owner');

            cy.log('**Removing current user from space should direct user to dashboard**');
            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'USER_ID')
                .find(':contains("Editor")').eq(0)
                .click();
            cy.get('[data-testid=userAccessOptionLabel]').eq(1)
                .should('contain.text', 'Remove')
                .click();
            cy.contains('Do you still want to remove yourself as editor?').should('exist');
            cy.contains('Yes').click();

            cy.log('**The space current user was removed from should no longer be on dashboard**');
            cy.url().should('eq', Cypress.config().baseUrl + '/user/dashboard');
            cy.contains('Flipping Sweet').should('not.exist');
        });
    });
});

const openShareAccessForm = (): void => {
    cy.get('[data-testid=accountDropdownToggle]').click();
    cy.get('[data-testid=shareAccess]').click();
    cy.get('[data-testid=modalContent]').should('exist');
};

const expandInviteToViewModalCard = (): void => {
    cy.get('@inviteToViewModalCard').contains('Invite others to view').click();
};

const expandInviteToEditModalCard = (): void => {
    cy.get('@inviteToEditModalCard').contains('Invite others to edit').click();
};

const inviteToViewModalCardShouldBeExpanded = (): void => {
    cy.get('@inviteToViewModalCard')
        .should('have.attr', 'aria-expanded', 'true');
    cy.get('@inviteToEditModalCard')
        .should('have.attr', 'aria-expanded', 'false');
};

const inviteToEditModalCardShouldBeExpanded = (): void => {
    cy.get('@inviteToViewModalCard')
        .should('have.attr', 'aria-expanded', 'false');
    cy.get('@inviteToEditModalCard')
        .should('have.attr', 'aria-expanded', 'true');
};
