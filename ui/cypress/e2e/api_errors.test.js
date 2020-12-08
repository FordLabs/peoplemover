/// <reference types="Cypress" />

import '../support/commands';

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;

describe('Api Errors', () => {
    const mockAccessTokenCookie = '123234234';
    
    beforeEach(() => {
        cy.server();
        cy.setCookie('accessToken', mockAccessTokenCookie);

        cy.getCookie('accessToken')
            .should('have.property', 'value', mockAccessTokenCookie);
    });

    it('Redirects to 404 page when space does not exist', () => {
        cy.route('GET', '/api/spaces/fake-path').as('getSpaces');
        cy.visit(`/fake-path`);

        cy.wait('@getSpaces').then(({xhr}) => {
            expect(xhr.status).to.equal(BAD_REQUEST);

            cy.window().then((win) => {
                expect(win.location.pathname).to.equal('/error/404');

                cy.getCookie('accessToken')
                    .should('have.property', 'value', mockAccessTokenCookie);
            });
        });
    });

    it('Clear access token cookie when 401 error occurs', () => {
        cy.route({
            method: 'GET',
            url: '/api/spaces/' +  Cypress.env('SPACE_UUID'),
            status: UNAUTHORIZED,
            response: {},
        }).as('getSpaces');

        cy.visit('/' + Cypress.env('SPACE_UUID'));

        cy.wait('@getSpaces').then(({xhr}) => {
            expect(xhr.status).to.equal(UNAUTHORIZED);

            cy.getCookie('accessToken')
                .should('equal', null);
        });
    });
});
