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

        it('Add people to a space should show link to space url', () => {
            cy.server();
            cy.route('POST', Cypress.env('API_USERS_PATH')).as('postAddPersonToSpace');
            const spaceUuid = Cypress.env('SPACE_UUID');
            const baseUrl = Cypress.config().baseUrl;

            cy.get('[data-testid=userIdName]').eq(0).should('contain.text', 'USER_ID');

            cy.get('[id=employeeIdTextArea]').focus().clear().type('aaaaaa#');
            cy.get('.primaryButton').should('be.disabled');

            cy.get('[id=employeeIdTextArea]').focus().clear().type('Elise');
            cy.get('[data-testid=inviteEditorsFormSubmitButton]').should('not.be.disabled').click();

            cy.wait('@postAddPersonToSpace')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
                });

            cy.get('[data-testid=modalCard]')
                .should('have.attr', 'aria-expanded', 'true')
                .should('not.have.attr', 'hidden');

            cy.get('[data-testid=grantEditAccessConfirmationFormLinkToSpace]')
                .should('contain', baseUrl + '/' + spaceUuid);
            cy.get('[data-testid=grantEditAccessConfirmationFormCopyButton]')
                .should('contain', 'Copy link' )
                .click()
                .should('contain', 'Copied' );
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
            cy.get('[data-testid=userAccessOptionLabel]').eq(2).should('contain.text', 'Remove')
                .click();
            cy.get('[data-testid=userIdName]').eq(1).should('not.exist');
            cy.get('[data-testid=userListItem__ELISE]').should('not.exist');
        });

        it('Transferring ownership to an editor should change current owner to editor', () => {
            cy.server();
            cy.route('POST', Cypress.env('API_USERS_PATH')).as('postAddPersonToSpace');
            cy.route('PUT', `${Cypress.env('API_USERS_PATH')}/ELISE`).as('putChangeOwner');
            cy.route('GET', Cypress.env('API_USERS_PATH')).as('getAllUsers');

            cy.get('[id=employeeIdTextArea]').focus().clear().type('Elise');
            cy.get('[data-testid=inviteEditorsFormSubmitButton]').should('not.be.disabled').click();

            cy.wait('@postAddPersonToSpace')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
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

            cy.get('[data-testid=userAccessOptionLabel]').eq(1).should('contain.text', 'Owner')
                .click();

            cy.get('[data-testid=confirmDeleteButton]').should('contain.text', 'Yes').click();

            cy.wait('@putChangeOwner')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
                });

            cy.wait('@getAllUsers')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
                });

            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'USER_ID');
            cy.get('[data-testid=userListItem__USER_ID]')
                .should('contain.text', 'Editor');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'ELISE');
            cy.get('[data-testid=userListItem__ELISE]')
                .should('contain.text', 'owner');
        });
    });
});

const openShareAccessForm = () => {
    cy.get('[data-testid=accountDropdownToggle]').click();
    cy.get('[data-testid=shareAccess]').click();
    cy.get('[data-testid=modalContainer]').should('exist');
};

const expandInviteToViewModalCard = () => {
    cy.get('@inviteToViewModalCard').click();
};

const expandInviteToEditModalCard = () => {
    cy.get('@inviteToEditModalCard').click();
};

const inviteToViewModalCardShouldBeExpanded = () => {
    cy.get('@inviteToViewModalCard')
        .should('have.attr', 'aria-expanded', 'true')
        .should('not.have.attr', 'hidden');
    cy.get('@inviteToEditModalCard')
        .should('have.attr', 'aria-expanded', 'false')
        .should('have.attr', 'hidden');
};

const inviteToEditModalCardShouldBeExpanded = () => {
    cy.get('@inviteToViewModalCard')
        .should('have.attr', 'aria-expanded', 'false')
        .should('have.attr', 'hidden');
    cy.get('@inviteToEditModalCard')
        .should('have.attr', 'aria-expanded', 'true')
        .should('not.have.attr', 'hidden');
};
