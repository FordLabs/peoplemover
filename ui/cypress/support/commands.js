// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import testProduct from '../fixtures/product';
import testPerson from '../fixtures/person';
const BASE_API_URL = Cypress.env('BASE_API_URL');
const spaceId = Cypress.env('SPACE_ID');
const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;
const BASE_PERSON_URL =  `${BASE_API_URL}/person`;
const BASE_ROLE_URL =  `${BASE_API_URL}/role`;

Cypress.Commands.add('resetBoard', () => {
    cy.log('Reset Board.');

    const todaysDate = Cypress.moment().format('yyyy-MM-DD');
    cy.request('GET', `${BASE_PRODUCT_URL}/1/${todaysDate}`)
        .then(({ body: allProducts = [] }) => {
            const product = allProducts.find(product => product.name === testProduct.name);
            if (product) {
                deleteProduct(product.id);
                deleteTags(product.productTags);
                deleteLocation(product.spaceLocation);
            }
        });

    cy.request('GET', `${BASE_PERSON_URL}/${spaceId}`)
        .then(({ body: allPeople = [] }) => {

            const person = allPeople.find(person => person.name === testPerson.name);
            if (person) {
                console.log(person);
                deletePerson(person.id);
            }
        });

    cy.request('GET', `${BASE_ROLE_URL}/${spaceId}`)
        .then(({ body: allRoles = [] }) => {
            const role = allRoles.find(role => role.name === testPerson.role);
            if (role) {
                deleteRole(role.id);
            }
        });
});

const deleteProduct = (productId) => {
    cy.request('DELETE', `${BASE_PRODUCT_URL}/${productId}`);
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

const deletePerson = (personId) => {
    cy.request('DELETE', `${BASE_PERSON_URL}/${personId}`);
};

const deleteRole = (roleId) => {
    cy.request('DELETE', `${BASE_ROLE_URL}/${roleId}`);
};

Cypress.Commands.add('getModal', () => {
    return cy.get('[data-testid=modalPopupContainer]');
});

Cypress.Commands.add('closeModal', () => {
    cy.get('[data-testid=modalCloseButton]').click();
    cy.getModal().should('not.be.visible');
});