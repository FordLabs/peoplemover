describe('Account Dropdown', () => {
    beforeEach(() => {
        cy.visitBoard();
    });

    it('Add people to a space should fail is email address is not properly formatted', ()=>{
        cy.get('[data-testid=accountDropdownToggle]').click();
        cy.get('[data-testid=share-access]').click();
        cy.get('[data-testid=emailTextArea]').focus().type('aaaaaa');
        cy.get('.primaryButton').should('be.disabled');
    });

    it('Add people to a space should show link to space url', ()=>{
        cy.server();
        cy.route('PUT', Cypress.env('API_INVITE_PEOPLE_PATH')).as('putAddPersonToSpace');
        const spaceUuid = Cypress.env('SPACE_UUID');
        const baseUrl = Cypress.config().baseUrl;

        cy.get('[data-testid=accountDropdownToggle]').click();
        cy.get('[data-testid=share-access]').click();
        cy.get('[data-testid=emailTextArea]').focus().type('Elise@grif.com');
        cy.get('[data-testid=share_access_invite_button]').should('not.be.disabled').click();

        cy.wait('@putAddPersonToSpace')
            .should((xhrs) => {
                expect(xhrs.status).to.equal(200);
            })

        cy.get('[data-testid=invite_contributors_confirmation_link]').contains(baseUrl + '/' + spaceUuid);
        cy.get('[data-testid=invite_contributors_confirmation_copy_button]')
            .contains('Copy link')
            .click()
            .contains('Copied!');
        cy.get('[data-testid=invite_contributor_done_button]').click();
        cy.get('[data-testid=modalPopupContainer]').should('not.be.visible')
    });
})
