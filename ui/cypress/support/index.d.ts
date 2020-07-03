/// <reference types="Cypress" />

declare namespace Cypress {
    interface Chainable {
        resetBoard(): Chainable<any>;
        getModal(): Chainable<any>;
        closeModal(): Chainable<any>;
    }
}