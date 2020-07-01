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
const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;

Cypress.Commands.add('resetBoard', () => {
    cy.log('Reset Board.');

    const todaysDate = Cypress.moment().format('yyyy-MM-DD');
    cy.request('GET', `${BASE_PRODUCT_URL}/1/${todaysDate}`)
        .then(({ body: allProducts = [] }) => {
            const product = allProducts.find(product => product.name === testProduct.name);
            if (product) {
                deleteProduct(product);
                deleteTags(product.productTags);
                deleteLocation(product.spaceLocation);
            }
        });
});

const deleteProduct = (product) => {
    cy.request('DELETE', `${BASE_PRODUCT_URL}/${product.id}`);
};

const deleteTags = (productTags) => {
    const BASE_PRODUCT_TAGS_URL = `${BASE_API_URL}/producttag/${spaceId}`;
    productTags.forEach(tagData => {
        if (testProduct.tags.includes(tagData.name)) {
            cy.request('DELETE', `${BASE_PRODUCT_TAGS_URL}/${tagData.id}`);
        }
    });
};

const deleteLocation = (spaceLocation) => {
    const BASE_LOCATION_URL = `${BASE_API_URL}/location/${spaceId}`;
    const locationData = spaceLocation.name === testProduct.location && spaceLocation;
    if (locationData) {
        cy.request('DELETE', `${BASE_LOCATION_URL}/${locationData.id}`);
    }
};