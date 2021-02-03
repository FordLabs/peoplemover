// ***********************************************
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const spaceUuid = Cypress.env('SPACE_UUID');

const BASE_API_URL = Cypress.env('BASE_API_URL');

Cypress.Commands.add('visitSpace', ({ locationData, productTagsData } = {}) => {
    cy.server();
    const date = Cypress.moment().format('yyyy-MM-DD');
    cy.route('GET', `${Cypress.env('API_PRODUCTS_PATH')}?requestedDate=${date}`).as('getProductsByDate');
    cy.route('GET', Cypress.env('API_ROLE_PATH')).as('getRoles');
    const locationRoute = {
        method: 'GET',
        url: Cypress.env('API_LOCATION_PATH'),
    };
    if (locationData) locationRoute.response = locationData;
    cy.route(locationRoute).as('getLocations');

    const productTagsRoute = {
        method: 'GET',
        url: Cypress.env('API_PRODUCT_TAG_PATH'),
    };
    if (productTagsData) productTagsRoute.response = productTagsData;
    cy.route(productTagsRoute).as('getProductTags');

    cy.visit(`/${spaceUuid}`);

    const waitForEndpointsToComplete = [
        '@getProductsByDate',
        '@getRoles',
        '@getLocations',
        '@getProductTags',
    ];
    cy.wait(waitForEndpointsToComplete)
        .then(() => {
            cy.get('[data-testid*=productCardContainer__]')
                .should(($productCards) => {
                    expect($productCards).to.have.length.greaterThan(1);
                });
        });
});

Cypress.Commands.add('getModal', () => {
    return cy.get('[data-testid=modalCard]');
});

Cypress.Commands.add('closeModal', () => {
    cy.get('[data-testid=modalCloseButton]').click();
    cy.getModal().should('not.exist');
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
    const RESET_SPACE_URL = `${BASE_API_URL}/api/reset/${spaceUuid}`;
    cy.request('DELETE', RESET_SPACE_URL);
});
