// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import testProduct from '../fixtures/product';
const BASE_API_URL = Cypress.env('BASE_API_URL');
const spaceId = Cypress.env('SPACE_ID');

Cypress.Commands.add('goToTestBoard', () => {
    cy.visit(`/${spaceId}`);

    cy.get('[data-testid=productCardContainer]')
        .should('exist');
});

Cypress.Commands.add('resetBoard', (productName, date = Cypress.moment().format('yyyy-MM-DD')) => {
    cy.log('Clean up board if necessary.');
    cy.resetProduct(testProduct.name);
    cy.resetProductTags(testProduct.tags);
    cy.resetLocation(testProduct.location);
    cy.log('Board Cleaned.');
});

Cypress.Commands.add('resetProduct', (productName, date = Cypress.moment().format('yyyy-MM-DD')) => {
    const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;

    cy.request('GET', `${BASE_PRODUCT_URL}/1/${date}`)
        .then(({ body: allProducts = [] }) => {
            const productData = allProducts.find(product => product.name === productName);
            if (productData) {
                cy.request('DELETE', `${BASE_PRODUCT_URL}/${productData.id}`);
                cy.log('Removed Product: ' + productData.name);
            }
        });
});

Cypress.Commands.add('resetProductTags', (tags = []) => {
    const BASE_PRODUCT_TAGS_URL = `${BASE_API_URL}/producttag/${spaceId}`;

    cy.request('GET',  BASE_PRODUCT_TAGS_URL)
        .then(({ body: allTags = [] }) => {
            allTags.forEach(tagData => {
                if (tags.includes(tagData.name)) {
                    cy.request('DELETE', `${BASE_PRODUCT_TAGS_URL}/${tagData.id}`);
                    cy.log('Removed Product Tag: ' + tagData.name);
                }
            });
        });
});

Cypress.Commands.add('resetLocation', (locationName) => {
    const BASE_LOCATION_URL = `${BASE_API_URL}/location/${spaceId}`;

    cy.request('GET',  BASE_LOCATION_URL)
        .then(({ body: allLocations = [] }) => {
            const locationData = allLocations.find(location => location.name === locationName);
            if (locationData) {
                cy.request('DELETE', `${BASE_LOCATION_URL}/${locationData.id}`);
                cy.log('Removed Location: ' + locationData.name);
            }
        });
});
