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
import person from '../fixtures/person';

describe('Roles', () => {
    const mockRole = person.role;
    const mockColor = { id: 7, color: '#FCBAE9' };
    const pink = 'rgb(252, 186, 233)';
    const defaultColor = 'rgb(255, 255, 255)';

    it('Old UI - add a new role', () => {
        cy.visitSpace();
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');

        cy.get('[data-testid=myRolesButton]').click();

        cy.getModal().should('contain', 'My Roles');

        cy.get('[data-testid=tagName__role]').contains(mockRole).should('not.exist');

        cy.get('[data-testid=addNewButton__role]').click();

        cy.get('[data-testid=editTagRow__role]').as('colorDropdownToggle');

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', defaultColor);

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectDropdownToggle]').click();

        cy.get('[data-testid=selectOption__6]').as('colorOption');

        cy.get('@colorOption')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('@colorOption').click();

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('[data-testid=tagNameInput]').clear().type(mockRole).should('have.value', mockRole);

        cy.get('[data-testid=saveTagButton]').click();

        cy.wait('@postNewRole').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(mockRole);
            expect(xhr?.response?.body.color).to.deep.equal(mockColor);
        });

        cy.contains(mockRole).parent('[data-testid=viewTagRow]').should(($lis) => {
            expect($lis).to.have.descendants('[data-testid=editIcon__role]');
            expect($lis).to.have.descendants('[data-testid=deleteIcon__role]');
            expect($lis).to.have.descendants(`[data-testid="myRolesCircle__${mockRole}"]`);
        }).then(($lis) => {
            cy.get($lis).find(`[data-testid="myRolesCircle__${mockRole}"]`).should('have.css', 'background-color', pink);
        });

        cy.closeModal();

        cy.selectOptionFromReactSelect('[data-testid=filters]', mockRole);
    });

    it('Add a new role', () => {
        cy.visitSpace({}, '#newui');
        cy.server();
        cy.route('POST', Cypress.env('API_ROLE_PATH')).as('postNewRole');

        cy.get('[data-testid=dropdown_button_Role]').click();

        cy.get('[data-testid=open_Role_modal_button]').click();

        cy.getModal().should('contain', 'My Roles');

        cy.get('[data-testid=tagName__role]').contains(mockRole).should('not.exist');

        cy.get('[data-testid=addNewButton__role]').click();

        cy.get('[data-testid=editTagRow__role]').as('colorDropdownToggle');

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', defaultColor);

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectDropdownToggle]').click();

        cy.get('[data-testid=selectOption__6]').as('colorOption');

        cy.get('@colorOption')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('@colorOption').click();

        cy.get('@colorDropdownToggle')
            .find('[data-testid=selectRoleCircle]')
            .should('have.css', 'background-color', pink);

        cy.get('[data-testid=tagNameInput]').clear().type(mockRole).should('have.value', mockRole);

        cy.get('[data-testid=saveTagButton]').click();

        cy.wait('@postNewRole').should(xhr => {
            expect(xhr?.status).to.equal(200);
            expect(xhr?.response?.body.name).to.equal(mockRole);
            expect(xhr?.response?.body.color).to.deep.equal(mockColor);
        });

        cy.contains(mockRole).parent('[data-testid=viewTagRow]').should(($lis) => {
            expect($lis).to.have.descendants('[data-testid=editIcon__role]');
            expect($lis).to.have.descendants('[data-testid=deleteIcon__role]');
            expect($lis).to.have.descendants(`[data-testid="myRolesCircle__${mockRole}"]`);
        }).then(($lis) => {
            cy.get($lis).find(`[data-testid="myRolesCircle__${mockRole}"]`).should('have.css', 'background-color', pink);
        });

        cy.closeModal();

        cy.get('[data-testid=dropdown_button_Role]').click();
        cy.contains(mockRole);
    });
});
