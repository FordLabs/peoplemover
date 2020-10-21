/*
 * Copyright (c) 2020 Ford Motor Company
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
import RoleClient from '../Roles/RoleClient';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import MyRolesModal from '../Roles/MyRolesModal';

describe('PeopleMover Role Modal', () => {
    let app: RenderResult;
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space, allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions} as GlobalStateProps;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await act(async () => {
            app = renderWithRedux(<MyRolesModal/>, undefined, initialState);
        });
    });

    it('Should open the My Roles Modal on click on My Roles text', async () => {
        await app.findByTestId('myRolesModalContainer');
    });

    it('should show existing roles', async () => {
        const myRolesModalContainer = await app.findByTestId('myRolesModalContainer');
        await findByText(myRolesModalContainer, 'Software Engineer');
        await findByText(myRolesModalContainer, 'Product Designer');
        await findByText(myRolesModalContainer, 'Product Manager');
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
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: 'Software Engineer'}});

            const saveButton = await app.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            await app.findByText('A role with this name already exists. Enter a different name.');
        });

        it('should add new role section when you click Add New Role', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            await app.findByTestId('saveTagButton');
            expect(app.queryByText('Add New Role')).not.toBeInTheDocument();
        });

        it('should hide add new role section when you click on cancel', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const cancelButton = await app.findByTestId('cancelTagButton');
            fireEvent.click(cancelButton);

            await app.findByText('Add New Role');
            expect(app.queryByText('Cancel')).not.toBeInTheDocument();
        });

        it('should make role with white color if user never changed color option', async () => {
            const expectedNewRoleName = 'Architecture';

            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const roleNameField = await app.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: expectedNewRoleName}});

            const saveButton = await app.findByTestId('saveTagButton');
            fireEvent.click(saveButton);

            await wait(() => {
                expect(app.queryByTestId('saveTagButton')).not.toBeInTheDocument();
            });

            const expectedRoleAddRequest: RoleAddRequest = {
                name: expectedNewRoleName,
                colorId: TestUtils.whiteColor.id,
            };
            expect(RoleClient.add).toHaveBeenCalledWith(expectedRoleAddRequest, initialState.currentSpace.uuid!!);
        });

        it('should not allow saving empty role', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await app.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();
        });

        it('should reenable save button after typing', async () => {
            const addNewRoleButton = await app.findByText('Add New Role');
            fireEvent.click(addNewRoleButton);

            const saveButton = await app.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            const roleNameField = await app.findByTestId('tagNameInput');
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
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const roleNameField = await app.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: 'Product Manager'}});
            // fireEvent.change(roleNameField, {target: {value: 'Product Designer'}});

            const saveButton = await app.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            await app.findByText('A role with this name already exists. Enter a different name.');
        });

        it('should show edit section when clicking the pencil', async () => {
            let roleEditIcons = await app.findAllByTestId('roleEditIcon');
            expect(roleEditIcons.length).toEqual(3);

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            expect(app.findByTestId('saveTagButton')).not.toBeNull();
            expect(app.queryByTestId('roleEditIcon')).toBeNull();
        });

        it('should auto-populate name field when opening edit role section', async () => {
            const roleEditIcons = await app.findAllByTestId('roleEditIcon');

            const myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const myRolesModalContainer = await app.findByTestId('myRolesModalContainer');
            const roleNameInputField: HTMLInputElement = await findByTestId(myRolesModalContainer, 'tagNameInput') as HTMLInputElement;
            expect(roleNameInputField.value).toEqual('Product Designer');
        });

        it('should not allow saving empty role', async () => {
            let roleEditIcons = await app.findAllByTestId('roleEditIcon');
            let myFirstPencil = roleEditIcons[0];
            fireEvent.click(myFirstPencil);

            const saveButton = await app.findByTestId('saveTagButton');
            expect(saveButton).toBeDisabled();

            const roleNameField = await app.findByTestId('tagNameInput');
            fireEvent.change(roleNameField, {target: {value: ''}});

            expect(saveButton).toBeDisabled();
        });
    });

    describe('deleting a role', () => {
        const deleteWarning = 'Deleting this role will remove it from any person that has been given this role.';

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

            const expectedRoleId = 2;
            expect(RoleClient.delete).toHaveBeenCalledWith(expectedRoleId, initialState.currentSpace.uuid);
            await wait(() => {
                expect(app.queryByText(deleteWarning)).not.toBeInTheDocument();
            });

            const myRolesModalContainer = await app.findByTestId('myRolesModalContainer');
            expect(queryByText(myRolesModalContainer, 'Product Manager')).not.toBeInTheDocument();
        });
    });

    describe('interaction between editing and creating role', () => {

        it('should not show pen and trash can when add new tag is clicked', async () => {
            expect(app.queryAllByTestId('roleEditIcon').length).toEqual(3);
            expect(app.queryAllByTestId('roleDeleteIcon').length).toEqual(3);

            const addNewLocationButton = await app.findByText('Add New Role');
            fireEvent.click(addNewLocationButton);

            expect(app.queryAllByTestId('roleEditIcon').length).toEqual(0);
            expect(app.queryAllByTestId('roleDeleteIcon').length).toEqual(0);
        });

        it('should not show pen and trash icons when editing role', async () => {
            expect(app.queryAllByTestId('roleEditIcon').length).toEqual(3);
            expect(app.queryAllByTestId('roleDeleteIcon').length).toEqual(3);
            fireEvent.click(app.queryAllByTestId('roleEditIcon')[0]);

            expect(app.queryAllByTestId('roleEditIcon').length).toEqual(0);
            expect(app.queryAllByTestId('roleDeleteIcon').length).toEqual(0);
        });

        it('should have create role button disabled when editing role', async () => {
            fireEvent.click(app.queryAllByTestId('roleEditIcon')[0]);

            const addNewLocationButton = await app.findByText('Add New Role');
            expect(addNewLocationButton).toBeDisabled();
        });
    });
});
