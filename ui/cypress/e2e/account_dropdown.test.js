describe('Account Dropdown', () => {
    beforeEach(() => {
        cy.visitBoard();
    });
    
    context('Share Access', () => {
        it('Add people to a space should fail is email address is not properly formatted', () => {
            cy.get('[data-testid=accountDropdownToggle]').click();
            cy.get('[data-testid=shareAccess]').click();
            cy.get('[data-testid=emailTextArea]').focus().type('aaaaaa');
            cy.get('.primaryButton').should('be.disabled');
        });

        it('Add people to a space should show link to space url', () => {
            cy.server();
            cy.route('PUT', Cypress.env('API_INVITE_PEOPLE_PATH')).as('putAddPersonToSpace');
            const spaceUuid = Cypress.env('SPACE_UUID');
            const baseUrl = Cypress.config().baseUrl;

            cy.get('[data-testid=accountDropdownToggle]').click();
            cy.get('[data-testid=shareAccess]').click();
            cy.get('[data-testid=emailTextArea]').focus().type('Elise@grif.com');
            cy.get('[data-testid=shareAccessInviteButton]').should('not.be.disabled').click();

            cy.wait('@putAddPersonToSpace')
                .should((xhrs) => {
                    expect(xhrs.status).to.equal(200);
                });

            cy.get('[data-testid=inviteContributorsConfirmationLink]')
                .should('contain', baseUrl + '/' + spaceUuid);
            cy.get('[data-testid=inviteContributorsConfirmationCopyButton]')
                .should('contain', 'Copy link' )
                .click()
                .should('contain', 'Copied' );
            cy.get('[data-testid=inviteContributorDoneButton]').click();
            cy.get('[data-testid=modalPopupContainer]').should('not.be.visible');
        });
    });
});
