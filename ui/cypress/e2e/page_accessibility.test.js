/*
 * Copyright (c) 2021 Ford Motor Company
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

/// <reference types="Cypress" />

describe('Page Level Accessibility', () => {
    it('Landing Page', () => {
        cy.visit('/');
        cy.get('[data-testid=landingPage]');
        cy.injectAxe();
        cy.checkA11y();
    });

    it('Error page', () => {
        cy.visit(`/error/404`);
        cy.injectAxe();
        cy.get('[data-testid=errorPageTemplate]');
        cy.checkA11y();
    });

    it('Space Page', () => {
        cy.visitSpace();
        cy.injectAxe();
        cy.checkA11y();
    });

    // @todo figure out how to be able to visit this page in Cypress
    xit('Dashboard Page', () => {
        cy.visit('/user/dashboard');
        cy.injectAxe();
        cy.checkA11y();
    });
});