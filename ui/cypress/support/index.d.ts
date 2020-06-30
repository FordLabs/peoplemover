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

        goToTestBoard();

        resetProduct(productName: string);

        resetProductTags(productTags: Array<string>);

        resetLocation(locationName: string);

    }
}