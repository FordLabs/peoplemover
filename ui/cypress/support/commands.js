// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import product from "../fixtures/product";

const spaceUuid = Cypress.env('SPACE_UUID');

const BASE_API_URL = Cypress.env('BASE_API_URL');
const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;
const BASE_PERSON_URL =  `${BASE_API_URL}/person`;
const BASE_ROLE_URL =  `${BASE_API_URL}/role`;
const BASE_PRODUCT_TAGS_URL =  `${BASE_API_URL}/producttag`;
const BASE_LOCATION_TAGS_URL =  `${BASE_API_URL}/location`;
const BASE_ASSIGNMENT_URL = `${BASE_API_URL}/assignment`;

Cypress.Commands.add('visitBoard', () => {
    cy.server();
    const date = Cypress.moment().format('yyyy-MM-DD');
    cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}/${date}`).as('getProductsByDate');
    cy.route('GET', Cypress.env('API_ROLE_PATH')).as('getRoles');
    cy.route('GET', Cypress.env('API_LOCATION_PATH')).as('getLocations');

    cy.visit(`/${spaceUuid}`);

    const waitForEndpointsToComplete = [
        '@getProductsByDate',
        '@getRoles',
        '@getLocations',
    ];
    cy.wait(waitForEndpointsToComplete)
        .then(() => {
            cy.get('[data-testid=productCardContainer]')
                .should(($productCards) => {
                    expect($productCards).to.have.length.greaterThan(1);
                });
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


/* API requests */

Cypress.Commands.add('resetSpace', () => {
    const RESET_SPACE_URL = `${BASE_API_URL}/reset/${spaceUuid}`;
    cy.request('DELETE', RESET_SPACE_URL);
});

Cypress.Commands.add('addProduct', (productRequest) => {
    addProduct(productRequest);
});

Cypress.Commands.add('addPerson', (person) => {
    addPerson(person);
});

Cypress.Commands.add('addAssignment', (assignmentRequest) => {
    addAssignment(assignmentRequest);
});

const addPerson = (person) => {
    cy.request('POST', `${BASE_PERSON_URL}/${spaceId}`, person);
};

const addProduct = (productRequest) => {
    cy.request('POST', `${BASE_PRODUCT_URL}`, productRequest);
};

const addAssignment = (assignmentRequest) => {
    cy.request(`POST`, `${ BASE_ASSIGNMENT_URL}/create`, assignmentRequest);
};
