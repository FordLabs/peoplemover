/// <reference types="Cypress" />

declare namespace Cypress {
    interface Chainable {
        resetBoard(): Chainable<any>;
    }
}