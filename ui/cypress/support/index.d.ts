/// <reference types="Cypress" />

/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace Cypress {
    interface Chainable {
        visitSpace(): Chainable<any>;
        getModal(): Chainable<any>;
        closeModal(): Chainable<any>;

        resetSpace(uuid: string): Chainable<any>;

        selectOptionFromReactSelect(parentSelector: string, checkboxTextToSelect: string): Chainable<any>;
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
