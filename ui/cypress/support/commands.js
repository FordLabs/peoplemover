// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const BASE_API_URL = Cypress.env('BASE_API_URL');
const spaceId = Cypress.env('SPACE_ID');
const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;
const BASE_PERSON_URL =  `${BASE_API_URL}/person`;
const BASE_ROLE_URL =  `${BASE_API_URL}/role`;

Cypress.Commands.add('visitBoard', () => {
    cy.visit(`/${spaceId}`);

    cy.get('[data-testid=productCardContainer]')
        .should('exist');
});

Cypress.Commands.add('getModal', () => {
    return cy.get('[data-testid=modalPopupContainer]');
});

Cypress.Commands.add('closeModal', () => {
    cy.get('[data-testid=modalCloseButton]').click();
    cy.getModal().should('not.be.visible');
});

Cypress.Commands.add('resetProduct', (mockProduct) => {
    cy.log('Delete mock product and associated tags/location in db.');

    const todaysDate = Cypress.moment().format('yyyy-MM-DD');
    const ALL_PRODUCTS_BY_DATE_URL = `${BASE_PRODUCT_URL}/1/${todaysDate}`;
    cy.request('GET', ALL_PRODUCTS_BY_DATE_URL)
        .then(({ body: allProducts = [] }) => {
            const product = allProducts.find(product => product.name === mockProduct.name);
            if (product) {
                deleteProductById(product.id);

                product.productTags.forEach(tagData => {
                    if (mockProduct.tags.includes(tagData.name)) {
                        deleteTagById(tagData.id);
                    }
                });

                if (product.spaceLocation.name === mockProduct.location) {
                    deleteLocationById(product.spaceLocation.id);
                }
            }
        });
});

Cypress.Commands.add('resetPerson', (mockPerson) => {
    const ALL_PEOPLE_BY_SPACE_URL = `${BASE_PERSON_URL}/${spaceId}`;
    cy.request('GET', ALL_PEOPLE_BY_SPACE_URL)
        .then(({ body: allPeople = [] }) => {
            const person = allPeople.find(person => person.name === mockPerson.name);
            if (person) {
                deletePersonById(person.id);
                if (person.spaceRole) {
                    deleteRoleById(person.spaceRole.id);
                }
            }
        });
});

Cypress.Commands.add('resetRole', (mockRole) => {
    const ALL_ROLES_BY_SPACE_URL =  `${BASE_ROLE_URL}/${spaceId}`;
    cy.request('GET', ALL_ROLES_BY_SPACE_URL)
        .then(({ body: allRoles = [] }) => {
            const role = allRoles.find(role => role.name === mockRole);
            if (role) {
                deleteRoleById(role.id);
            }
        });
});

const deleteProductById = (productId) => {
    cy.request('DELETE', `${BASE_PRODUCT_URL}/${productId}`);
};

const deleteTagById = (tagId) => {
    const BASE_PRODUCT_TAGS_URL = `${BASE_API_URL}/producttag/${spaceId}`;
    cy.request('DELETE', `${BASE_PRODUCT_TAGS_URL}/${tagId}`);
};

const deleteLocationById = (locationId) => {
    const BASE_LOCATION_URL = `${BASE_API_URL}/location/${spaceId}`;
    cy.request('DELETE', `${BASE_LOCATION_URL}/${locationId}`);
};

const deletePersonById = (personId) => {
    cy.request('DELETE', `${BASE_PERSON_URL}/${personId}`);
};

const deleteRoleById = (roleId) => {
    cy.request('DELETE', `${BASE_ROLE_URL}/${roleId}`);
};