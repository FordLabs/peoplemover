/// <reference types="Cypress" />

declare namespace Cypress {
    interface Chainable {
        visitBoard(): Chainable<any>;

        resetProduct(): Chainable<any>;
        resetPerson(): Chainable<any>;
        resetRoles(): Chainable<any>;

        getModal(): Chainable<any>;
        closeModal(): Chainable<any>;
    }
}