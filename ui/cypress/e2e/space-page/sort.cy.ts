/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Chainable = Cypress.Chainable;

describe('Sort', () => {
    beforeEach(() => {
        cy.visitSpace();
        cy.server();

        cy.get('[data-testid=productCardContainer__my_product]').should(
            'exist'
        );
        cy.get('[data-testid=productCardContainer__baguette_bakery]').should(
            'exist'
        );

        cy.get('[data-testid=sortByDropdownButton]').as(
            'sortDropdownMenuButton'
        );

        defaultSortingMenuStateShouldBeAlphabetical();
    });

    it('Sort products alphabetically', () => {
        openSortingDropdownMenu();
        cy.get('[data-testid=sortDropdownOption_name]').click();

        cy.get('@sortDropdownMenuButton')
            .should('contain', 'Alphabetical')
            .should('contain', 'keyboard_arrow_down');

        cy.get('[data-testid=productListSortedContainer]')
            .as('productListSortContainer')
            .find('[data-testid*=productCardContainer__]')
            .should('have.length', 2)
            .eq(0)
            .should('contain', 'Baguette Bakery');

        cy.get('@productListSortContainer')
            .find('[data-testid*=productCardContainer__]')
            .eq(1)
            .should('contain', 'My Product');
    });

    it('Sort products by location', () => {
        openSortingDropdownMenu();
        cy.get('[data-testid=sortDropdownOption_location]').click();

        cy.get('@sortDropdownMenuButton')
            .should('contain', 'Location')
            .should('contain', 'keyboard_arrow_down');

        getProductListGroup1()
            .should('contain', 'Baguette Bakery')
            .should('contain', 'location1');

        getProductListGroup2()
            .should('contain', 'My Product')
            .should('contain', 'No Location');

        cy.log('**Pre-populate form with selected location**');
        cy.contains('Add Product').click();
        cy.getModal().should('exist').contains('location1');
    });

    it('Sort products by product tag', () => {
        openSortingDropdownMenu();
        cy.get('[data-testid=sortDropdownOption_product-tag]').click();

        cy.get('@sortDropdownMenuButton')
            .should('contain', 'Product Tag')
            .should('contain', 'keyboard_arrow_down');

        getProductListGroup1()
            .should('contain', 'My Product')
            .should('contain', 'productTag1');

        getProductListGroup2()
            .should('contain', 'Baguette Bakery')
            .should('contain', 'No Product Tag');

        cy.log('**Pre-populate form with selected product tags**');
        cy.contains('Add Product').click();
        cy.getModal().should('exist').contains('productTag1');
    });
});

function openSortingDropdownMenu(): void {
    cy.get('[data-testid=sortByDropdownButton]').click();
    cy.get('@sortDropdownMenuButton').should('contain', 'keyboard_arrow_up');
}

function defaultSortingMenuStateShouldBeAlphabetical() {
    cy.get('@sortDropdownMenuButton')
        .should('contain', 'Alphabetical')
        .should('contain', 'keyboard_arrow_down');
}

function getProductListGroup(): Chainable {
    return cy
        .get('[data-testid=productListGroupedContainer]')
        .find('[data-testid=productGroup]');
}

function getProductListGroup1(): Chainable {
    return getProductListGroup().should('have.length', 2).eq(0);
}

function getProductListGroup2(): Chainable {
    return getProductListGroup().eq(1);
}
