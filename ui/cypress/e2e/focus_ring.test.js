import person from '../fixtures/person';
const date = Cypress.moment().format('yyyy-MM-DD');

describe('People', () => {
    beforeEach(() => {
        cy.visitBoard();
    });

    it('Keyboard usage adds focus ring to buttons and anchors', () => {
        cy.get('body').trigger('keydown', {key: 'Tab'});
        cy.get('body.user-is-tabbing');
    });
});
