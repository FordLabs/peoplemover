/// <reference types="cypress" />

export interface ProductForm {
    name: string;
    location: string;
    tags: Array<string>;
    startDate: Date;
    nextPhaseDate: Date;
    notes: string;
}

declare namespace Cypress {
    interface Chainable {
        resetBoard(productName: string, date?: Date): Chainable<any>;

        resetProduct(productName: string): Chainable<any>;

        resetProductTags(productTags: Array<string>): Chainable<any>;

        resetLocation(locationName: string): Chainable<any>;
    }
}