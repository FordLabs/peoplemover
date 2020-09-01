/// <reference types="Cypress" />
import { Person } from '../fixtures/person';

declare namespace Cypress {
    interface Chainable {
        visitBoard(): Chainable<any>;
        resetSpace(uuid: string): Chainable<any>;
        getModal(): Chainable<any>;
        closeModal(): Chainable<any>;

        addProduct(productRequest): Chainable<any>;
        addPerson(person): Chainable<any>;
        addAssignment(assignmentRequest): Chainable<any>;

        selectOptionFromReactSelect(parentSelector: string, checkboxTextToSelect: number): Chainable<any>;
    }
}
