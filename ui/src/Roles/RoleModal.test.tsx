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

import React from 'react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {findByTestId, findByText, fireEvent, screen, waitFor} from '@testing-library/react';
import RoleClient from './RoleClient';
import {RoleAddRequest} from './RoleAddRequest.interface';
import MyRolesForm from './MyRolesForm';
import * as Actions from '../Redux/Actions';
import ColorClient from '../Roles/ColorClient';

describe('My Roles Form', () => {
    const initialState = {currentSpace: TestUtils.space, allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions, roles: TestUtils.roles};

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        renderWithRedux(<MyRolesForm/>, undefined, initialState);

        await waitFor(() => expect(ColorClient.getAllColors).toHaveBeenCalled());
    });

    it('should open the My Roles Modal on click on My Roles text', async () => {
        await screen.findByTestId('myRolesModalContainer');
    });

    it('should show existing roles', async () => {
        const myRolesModalContainer = await screen.findByTestId('myRolesModalContainer');
        await findByText(myRolesModalContainer, 'Software Engineer');
        await findByText(myRolesModalContainer, 'Product Designer');
        await findByText(myRolesModalContainer, 'Product Manager');
    });

    it('should show existing roles with color-circle', async () => {
        expect(await screen.findByTestId(`myRolesCircle__${TestUtils.roles[0].name}`)).toHaveStyle(`background-color: ${TestUtils.color3.color}`);
        expect(await screen.findByTestId(`myRolesCircle__${TestUtils.roles[1].name}`)).toHaveStyle(`background-color: ${TestUtils.color2.color}`);
        expect(await screen.findByTestId(`myRolesCircle__${TestUtils.roles[2].name}`)).toHaveStyle(`background-color: ${TestUtils.color1.color}`);
    });

    describe('adding roles', () => {
        beforeEach(() => {
            expect(screen.queryByText('Save')).not.toBeInTheDocument();
        });

        it('should show error message when duplicated role is added', async () => {
            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await screen.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: 'Software Engineer'}});

            const saveButton = await screen.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            await screen.findByText('Oops! You already have this role. Please try using a different one.');
        });

        it('should add new role section when you click Add New Role', async () => {
            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            await screen.findByTestId('saveTagButton');
            expect(screen.queryByText('Add New Role')).not.toBeInTheDocument();
        });

        it('should hide add new role section when you click on cancel', async () => {
            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const cancelButton = await screen.findByTestId('cancelTagButton');
            fireEvent.click(cancelButton);

            await screen.findByText('Add New Role');
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
        });

        it('should make role with white color if user never changed color option', async () => {
            const fetchRolesActionFn = jest.spyOn(Actions, 'fetchRolesAction');

            const expectedNewRoleName = 'Architecture';

            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await screen.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: expectedNewRoleName}});

            const saveButton = await screen.findByTestId('saveTagButton');
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.queryByTestId('saveTagButton')).not.toBeInTheDocument();
            });

            const expectedRoleAddRequest: RoleAddRequest = {
                name: expectedNewRoleName,
                colorId: TestUtils.whiteColor.id,
            };
            expect(RoleClient.add).toHaveBeenCalledTimes(1);
            expect(RoleClient.add).toHaveBeenCalledWith(expectedRoleAddRequest, initialState.currentSpace);
            expect(RoleClient.get).toHaveBeenCalledTimes(1);
            expect(RoleClient.get).toHaveBeenCalledWith(initialState.currentSpace.uuid);
            expect(fetchRolesActionFn).toHaveBeenCalledTimes(1);
        });

        it('should not allow saving empty role', async () => {
            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await screen.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();
        });

        it('should reenable save button after typing', async () => {
            const addNewRoleButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await screen.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            const roleNameField = await screen.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: 'hello'}});
            expect(saveButton).not.toBeDisabled();
        });
    });

    describe('editing a role', () => {
        it('should show pencil icon', async () => {
            const roleEditIcons = await screen.findAllByTestId('editIcon__role');
            expect(roleEditIcons.length).toEqual(3);
        });

        it('should display error message when name is changed to existing role name', async () => {

            const roleEditIcons = await screen.findAllByTestId('editIcon__role');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const roleNameField = await screen.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: 'Product Manager'}});

            const saveButton = await screen.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            await screen.findByText('Oops! You already have this role. Please try using a different one.');
        });

        it('should show edit section when clicking the pencil', async () => {
            let roleEditIcons = await screen.findAllByTestId('editIcon__role');
            expect(roleEditIcons.length).toEqual(3);

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            expect(screen.findByTestId('saveTagButton')).not.toBeNull();
            expect(screen.queryByTestId('roleEditIcon')).toBeNull();
        });

        it('should auto-populate name field when opening edit role section', async () => {
            const roleEditIcons = await screen.findAllByTestId('editIcon__role');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const myRolesModalContainer = await screen.findByTestId('myRolesModalContainer');
            const roleNameInputField: HTMLInputElement = await findByTestId(myRolesModalContainer, 'tagNameInput') as HTMLInputElement;
            expect(roleNameInputField.value).toEqual('Product Designer');
        });

        it('should not allow saving empty role', async () => {
            let roleEditIcons = await screen.findAllByTestId('editIcon__role');
            let myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const saveButton = await screen.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            const roleNameField = await screen.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: ''}});

            expect(saveButton).toBeDisabled();
        });
    });

    describe('deleting a role', () => {
        const deleteWarning = 'Deleting this role will remove it from any person that has been given this role.';

        it('should show trashcan icon', async () => {
            const roleDeleteIcons = await screen.findAllByTestId('deleteIcon__role');
            expect(roleDeleteIcons.length).toEqual(3);
        });

        it('should show the confirm delete modal if clicking the trash', async () => {
            const roleDeleteIcons = await screen.findAllByTestId('deleteIcon__role');
            const firstTrashIcon = roleDeleteIcons[0];
            fireEvent.click(firstTrashIcon);

            await screen.findByText(deleteWarning);
        });

        it('should delete role after confirmation', async () => {
            const roleDeleteIcons = await screen.findAllByTestId('deleteIcon__role');
            const secondTrashIcon = roleDeleteIcons[1];
            fireEvent.click(secondTrashIcon);

            await screen.findByText(deleteWarning);
            const confirmDeleteButton = await screen.findByTestId('confirmDeleteButton');
            fireEvent.click(confirmDeleteButton);

            expect(RoleClient.delete).toHaveBeenCalledWith(TestUtils.productManager.id, initialState.currentSpace);
            await waitFor(() => {
                expect(screen.queryByText(deleteWarning)).not.toBeInTheDocument();
            });
        });
    });

    describe('Interaction between editing and creating role', () => {
        it('should not show pen and trash can when add new tag is clicked', async () => {
            expect(screen.queryAllByTestId('editIcon__role').length).toEqual(3);
            expect(screen.queryAllByTestId('deleteIcon__role').length).toEqual(3);

            const addNewLocationButton = await screen.findByText('Add New Role');
            fireEvent.click(addNewLocationButton);

            expect(screen.queryAllByTestId('editIcon__role').length).toEqual(0);
            expect(screen.queryAllByTestId('deleteIcon__role').length).toEqual(0);
        });

        it('should not show pen and trash icons when editing role', async () => {
            expect(screen.queryAllByTestId('editIcon__role').length).toEqual(3);
            expect(screen.queryAllByTestId('deleteIcon__role').length).toEqual(3);
            fireEvent.click(screen.queryAllByTestId('editIcon__role')[0]);

            expect(screen.queryAllByTestId('editIcon__role').length).toEqual(0);
            expect(screen.queryAllByTestId('deleteIcon__role').length).toEqual(0);
        });

        it('should have create role button disabled when editing role', async () => {
            fireEvent.click(screen.queryAllByTestId('editIcon__role')[0]);

            const addNewRoleButton = await screen.findByTestId('addNewButton__role');
            expect(addNewRoleButton).toBeDisabled();
        });
    });
});
