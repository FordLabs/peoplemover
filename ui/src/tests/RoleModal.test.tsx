/*
 * Copyright (c) 2019 Ford Motor Company
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

import React from 'react';
import TestUtils, {renderWithRedux} from './TestUtils';
import {act, findByTestId, findByText, fireEvent, queryByText, RenderResult, wait} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import RoleClient from '../Roles/RoleClient';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {PreloadedState} from "redux";
import {GlobalStateProps} from "../Redux/Reducers";

describe('PeopleMover Role Modal', () => {
    let app: RenderResult;
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await act(async () => {
            app = renderWithRedux(<PeopleMover/>, undefined, initialState);
            const myRolesButton = await app.findByText('My Roles');
            fireEvent.click(myRolesButton);
        });
    });

    it('Should open the My Roles Modal on click on My Roles text', async () => {
        await app.findByTestId('myRolesModalContainer');
    });

    it('should show existing roles', async () => {
        const modalContainer = await app.findByTestId('modalContainer');
        await findByText(modalContainer, 'Software Engineer');
        await findByText(modalContainer, 'Product Designer');
        await findByText(modalContainer, 'Product Manager');
    });

    it('should show existing roles with color-circle', async () => {
        const circles: Array<HTMLElement> = await app.findAllByTestId('myRolesCircle');
        expect(circles[0]).toHaveStyle('background-color: 1');
        expect(circles[1]).toHaveStyle('background-color: 2');
        expect(circles[2]).toHaveStyle('background-color: 3');
    });

    describe('adding roles', () => {
        beforeEach(() => {
            expect(app.queryByText('Save')).not.toBeInTheDocument();
        });

        it('should show error message when duplicated role is added', async () => {
            (RoleClient.add as Function) = jest.fn(() => Promise.reject({
                response: { status: 409 },
            }));

            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: 'I am a duplicate'}});

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await app.findByText('A role with this name already exists. Enter a different name.');
        });

        it('should add new role section when you click Add New Role', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            await app.findByText('Save');
            expect(app.queryByText('Add New Role')).not.toBeInTheDocument();
        });

        it('should hide add new role section when you click on cancel', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const cancelButton = await app.findByText('Cancel');
            fireEvent.click(cancelButton);

            await app.findByText('Add New Role');
            expect(app.queryByText('Cancel')).not.toBeInTheDocument();
        });

        it('should show all the color circles', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            expect(circles[0]).toHaveStyle('background-color: 1');
            expect(circles[1]).toHaveStyle('background-color: 2');
            expect(circles[2]).toHaveStyle('background-color: 3');
        });

        it('should highlight selected color circle when you make you selection', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            expect(circles[0]).not.toHaveClass('highlightedCircle');

            fireEvent.click(circles[0]);
            expect(circles[0]).toHaveClass('highlightedCircle');
            expect(circles[1]).not.toHaveClass('highlightedCircle');
            expect(circles[2]).not.toHaveClass('highlightedCircle');

            fireEvent.click(circles[1]);
            expect(circles[0]).not.toHaveClass('highlightedCircle');
            expect(circles[1]).toHaveClass('highlightedCircle');
            expect(circles[2]).not.toHaveClass('highlightedCircle');
        });

        it('should auto-highlight last circle', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            expect(circles[0]).not.toHaveClass('highlightedCircle');
            expect(circles[1]).not.toHaveClass('highlightedCircle');
            expect(circles[2]).not.toHaveClass('highlightedCircle');
            expect(circles[3]).toHaveClass('highlightedCircle');
        });

        it('should make role with white color if user never changed color option', async () => {
            const expectedNewRoleName = 'Architecture';

            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: expectedNewRoleName}});

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await wait(() => {
                expect(app.queryByText('Cancel')).not.toBeInTheDocument();
            });

            const expectedRoleAddRequest: RoleAddRequest = {
                name: expectedNewRoleName,
                colorId: TestUtils.whiteColor.id,
            };
            expect(RoleClient.add).toHaveBeenCalledWith(expectedRoleAddRequest, initialState.currentSpace.name);
        });

        it('should save role with the given name and color when you click on Save button', async () => {
            const expectedNewRoleName = 'Architecture';
            (RoleClient.add as Function) = jest.fn(() => Promise.resolve(
                {data: {name: expectedNewRoleName, id: 1, spaceId: -1, color: {color: '1', id: 2}}}
            ));

            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: expectedNewRoleName}});

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            fireEvent.click(circles[1]);

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await wait(() => {
                expect(app.queryByText('Cancel')).not.toBeInTheDocument();
            });

            const modalContainer = await app.findByTestId('modalContainer');
            await findByText(modalContainer, expectedNewRoleName);
        });

        it('should save role with the given name and color when you hit the Enter key', async () => {
            const expectedNewRoleName = 'Architecture';
            (RoleClient.add as Function) = jest.fn(() => Promise.resolve(
                {data: {name: expectedNewRoleName, id: 1, spaceId: -1, color: {color: '1', id: 2}}}
            ));

            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: expectedNewRoleName}});

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            fireEvent.click(circles[1]);

            fireEvent.keyPress(roleNameField, { key: 'Enter', code: 13, charCode: 13});

            await wait(() => {
                expect(app.queryByText('Cancel')).not.toBeInTheDocument();
            });

            const modalContainer = await app.findByTestId('modalContainer');
            await findByText(modalContainer, expectedNewRoleName);
        });

        it('should not allow saving empty role', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await app.findByText('Save');
            expect(saveButton).toBeDisabled();
        });

        it('should reenable save button after typing', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await app.findByText('Save');
            expect(saveButton).toBeDisabled();

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: 'hello'}});
            expect(saveButton).not.toBeDisabled();
        });
    });

    describe('editing a role', () => {
        it('should show pencil icon', async () => {
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');
            expect(roleEditIcons.length).toEqual(3);
        });

        it('should display error message when name is changed to existing role name', async () => {
            (RoleClient.edit as Function) = jest.fn(() => Promise.reject({
                response: { status: 409 },
            }));

            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: 'Product Designer'}});

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await app.findByText('A role with this name already exists. Enter a different name.');
        });

        it('should show edit section when clicking the pencil', async () => {
            let roleEditIcons = await app.findAllByTestId('roleEditIcon');
            expect(roleEditIcons.length).toEqual(3);

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            await app.findByText('Save');
            roleEditIcons = await app.findAllByTestId('roleEditIcon');
            expect(roleEditIcons.length).toEqual(2);
        });

        it('should auto-populate name field when opening edit role section', async () => {
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const modalContainer = await app.findByTestId('modalContainer');
            const roleNameInputField: HTMLInputElement = await findByTestId(modalContainer, 'traitName') as HTMLInputElement;
            expect(roleNameInputField.value).toEqual('Product Designer');
        });

        it('should auto-highlight role color circle when opening edit role section', async () => {
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const mySecondPencil = roleEditIcons[1];
            fireEvent.click(mySecondPencil);

            const circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            expect(circles[1]).toHaveClass('highlightedCircle');
        });

        it('should call edit role client and then display the updated role ', async () => {
            const updatedRoleName = 'Architecture';
            expect(app.queryByText(updatedRoleName)).not.toBeInTheDocument();

            let roleEditIcons = await app.findAllByTestId('roleEditIcon');
            let myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: updatedRoleName}});

            let circles: Array<HTMLElement> = await app.findAllByTestId('selectRoleCircle');
            fireEvent.click(circles[2]);

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await app.findByText(updatedRoleName);

            circles = await app.findAllByTestId('myRolesCircle');
            expect(circles[0]).toHaveStyle('background-color: 3');
            expect(circles[1]).toHaveStyle('background-color: 2');
            expect(circles[2]).toHaveStyle('background-color: 3');

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'Software Engineer')).not.toBeInTheDocument();
        });

        it('should not allow saving empty role', async () => {
            let roleEditIcons = await app.findAllByTestId('roleEditIcon');
            let myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const saveButton = await app.findByText('Save');
            expect(saveButton).not.toBeDisabled();

            const roleNameField = await app.findByTestId('traitName');
            fireEvent.change(roleNameField, {target: {value: ''}});

            expect(saveButton).toBeDisabled();
        });
    });

    describe('deleting a role', () => {
        const deleteWarning = 'Deleting this role will remove it from any person or product that has been given this role.';

        it('should show trashcan icon', async () => {
            const roleDeleteIcons = await app.findAllByTestId('roleDeleteIcon');
            expect(roleDeleteIcons.length).toEqual(3);
        });

        it('should show the confirm delete modal if clicking the trash', async () => {
            const roleDeleteIcons = await app.findAllByTestId('roleDeleteIcon');
            const firstTrashIcon = roleDeleteIcons[0];
            fireEvent.click(firstTrashIcon);

            await app.findByText(deleteWarning);
        });

        it('should delete role after confirmation', async () => {
            const roleDeleteIcons = await app.findAllByTestId('roleDeleteIcon');
            const secondTrashIcon = roleDeleteIcons[1];
            fireEvent.click(secondTrashIcon);

            await app.findByText(deleteWarning);
            const confirmDeleteButton = await app.findByTestId('confirmDeleteButton');
            fireEvent.click(confirmDeleteButton);

            expect(RoleClient.delete).toHaveBeenCalledWith(2);
            await wait(() => {
                expect(app.queryByText(deleteWarning)).not.toBeInTheDocument();
            });

            const modalContainer = await app.findByTestId('modalContainer');
            expect(queryByText(modalContainer, 'Product Manager')).not.toBeInTheDocument();
        });
    });

    describe('exiting', () => {
        it('should show a confirmation modal when trying to exit with unsaved changes', async () => {
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const modalCloseButton = await app.findByTestId('modalCloseButton');
            fireEvent.click(modalCloseButton);

            await app.findByText('Are you sure you want to close the window?');
        });
    });
});
