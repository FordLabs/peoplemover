// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const spaceId = Cypress.env('SPACE_UUID');

const BASE_API_URL = Cypress.env('BASE_API_URL');
const BASE_PRODUCT_URL =  `${BASE_API_URL}/product`;
const BASE_PERSON_URL =  `${BASE_API_URL}/person`;
const BASE_ROLE_URL =  `${BASE_API_URL}/role`;
const BASE_PRODUCT_TAGS_URL =  `${BASE_API_URL}/producttag`;
const BASE_LOCATION_TAGS_URL =  `${BASE_API_URL}/location`;

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

Cypress.Commands.add('selectOptionFromReactSelect', (parentSelector, checkboxTextToSelect) => {
    cy.get(parentSelector)
        .find('[class*="-control"]')
        .click(0, 0, { force: true })
        .get('[class*="-menu"]')
        .find('[class*="-option"]')
        .contains(checkboxTextToSelect)
        .click(0, 0, { force: true });
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
                        deleteProductTagById(tagData.id);
                    }
                });

                if (product.spaceLocation && (product.spaceLocation.name === mockProduct.location)) {
                    deleteLocationTagById(product.spaceLocation.id);
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

Cypress.Commands.add('resetLocationTags', () => {
    const ALL_TAGS_BY_SPACE_URL = `${BASE_LOCATION_TAGS_URL}/${spaceId}`;
    cy.request('GET', ALL_TAGS_BY_SPACE_URL)
        .then(({ body: allLocationTags = []}) => {
            allLocationTags.forEach(tagData => {
                deleteLocationTagById(tagData.id);
            });

        });
});

Cypress.Commands.add('resetProductTags', () => {
    const ALL_TAGS_BY_SPACE_URL = `${BASE_PRODUCT_TAGS_URL}/${spaceId}`;
    cy.request('GET', ALL_TAGS_BY_SPACE_URL)
        .then(({ body: allProductTags = []}) => {
            allProductTags.forEach(tagData => {
                deleteProductTagById(tagData.id);
            });
        });
});

Cypress.Commands.add('resetSpace', () =>{
    const DELETESPACEURL = `${BASE_API_URL}/space/${spaceId}`;
    cy.request('DELETE', DELETESPACEURL);
});

const deleteProductById = (productId) => {
    cy.request('DELETE', `${BASE_PRODUCT_URL}/${productId}`);
};

const deleteProductTagById = (tagId) => {
    cy.request('DELETE', `${BASE_PRODUCT_TAGS_URL}/${spaceId}/${tagId}`);
};

const deleteLocationTagById = (locationId) => {
    cy.request('DELETE', `${BASE_API_URL}/location/${spaceId}/${locationId}`);
};

const deletePersonById = (personId) => {
    cy.request('DELETE', `${BASE_PERSON_URL}/${personId}`);
};

const deleteRoleById = (roleId) => {
    cy.request('DELETE', `${BASE_ROLE_URL}/${roleId}`);
};
