// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const spaceUuid = Cypress.env('SPACE_UUID');

const BASE_API_URL = Cypress.env('BASE_API_URL');

Cypress.Commands.add('resetSpace', () => {
    const DELETE_SPACE_URL = `${BASE_API_URL}/reset/${spaceUuid}`;
    cy.request('DELETE', DELETE_SPACE_URL);
});

Cypress.Commands.add('visitBoard', () => {
    cy.visit(`/${spaceUuid}`);

    cy.get('[data-testid=productCardContainer]')
        .should(($productCards) => {
            expect($productCards).to.have.length.greaterThan(1);
        });
});

Cypress.Commands.add('getModal', () => {
    return cy.get('[data-testid=modalPopupContainer]');
});

Cypress.Commands.add('closeModal', () => {
    cy.get('[data-testid=modalCloseButton]').click();
    cy.getModal().should('not.be.visible');
});

Cypress.Commands.add('selectOptionFromReactSelect', (parentSelector, checkboxTextToSelect) => {
    cy.get(parentSelector)
        .find('[class*="-control"]')
        .click(0, 0, { force: true })
        .get('[class*="-menu"]')
        .find('[class*="-option"]')
        .contains(checkboxTextToSelect)
        .click(0, 0, { force: true });
});