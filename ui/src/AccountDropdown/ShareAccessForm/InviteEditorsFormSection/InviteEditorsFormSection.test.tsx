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

import {renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import React from 'react';
import InviteEditorsFormSection from './InviteEditorsFormSection';
import {fireEvent, screen, waitFor, within} from '@testing-library/react';
import Cookies from 'universal-cookie';
import SpaceClient from 'Services/Api/SpaceClient';
import {Space} from 'Types/Space';
import {CurrentUserState} from 'State/CurrentUserState';
import {CurrentSpaceState} from '../../../State/CurrentSpaceState';

jest.mock('Services/Api/SpaceClient');

describe('Invite Editors Form', function() {
    const cookies = new Cookies();

    beforeEach(() => {
        SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(TestData.spaceMappingsArray);

        cookies.set('accessToken', '123456');
    });

    describe('Feature toggle enabled', () => {
        describe('Add editors', () => {
            it('should render the local test space', async () => {
                const space: Space = {
                    id: 2,
                    uuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    name: 'local testSpace',
                    lastModifiedDate: TestData.originDateString,
                    todayViewIsPublic: true,
                };
                await renderComponent('User_id', space);
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: 'hford1'}});
                fireEvent.keyDown(inputField, {key: 'Enter', code: 'Enter'});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');

                fireEvent.click(screen.getByTestId('inviteEditorsFormSubmitButton'));

                await waitFor(() => expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith(space, ['hford1']));
            });

            it('should add users as editors', async function() {
                await renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: 'hford1'}});
                fireEvent.keyDown(inputField, {key: 'Enter', code: 'Enter'});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');

                fireEvent.click(screen.getByTestId('inviteEditorsFormSubmitButton'));

                await validateApiCall(['hford1']);
            });

            it('should not add invalid cdsid user as editor', async function() {
                await renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                fireEvent.change(
                    screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: '#ford'}}
                );

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('#ford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();

                fireEvent.click(submitButton);
                expect(SpaceClient.inviteUsersToSpace).not.toHaveBeenCalled();
            });

            it('should not add invalid cdsid user as editor (on Enter)', async function() {
                await renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: '#ford'}});
                fireEvent.keyDown(inputField, {key: 'Enter'});
                fireEvent.blur(inputField);

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('#ford');

                screen.getByText(/Please enter a valid CDSID/);

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                fireEvent.click(submitButton);

                expect(SpaceClient.changeOwner).not.toHaveBeenCalled();
            });

            it('should not add users as editors when one of them is invalid', async function() {
                await renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                fireEvent.change(
                    screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, #ford'}}
                );

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');
                screen.getByText('#ford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                fireEvent.click(submitButton);
                expect(SpaceClient.changeOwner).not.toHaveBeenCalled();
            });

            it('should add two users as editors when both are valid', async function() {
                await renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                fireEvent.change(
                    screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, bford'}}
                );

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');
                screen.getByText('bford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).not.toBeDisabled();
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                fireEvent.click(submitButton);

                await validateApiCall(['hford1', 'bford']);
            });

            describe('Submit Button and Error Message', () => {
                it('should be disabled/disabled when there is no input', async () => {
                    await renderComponent();
                    expect(await screen.findByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeNull();
                });

                it('should be enabled when there are entries, and disabled when there are none', async () => {
                    await renderComponent();
                    let inputField: HTMLElement;
                    expect(screen.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    await screen.findByText('Enter CDSID of your editors');
                    fireEvent.change(
                        screen.getByLabelText(/People with this permission can edit/),
                        {target: {value: 'hford1, bford'}}
                    );
                    expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(screen.queryByText('hford1')).toBeInTheDocument();
                    expect(screen.queryByText('bford')).toBeInTheDocument();
                    // Delete bford
                    inputField = screen.getByLabelText(/People with this permission can edit/);
                    fireEvent.keyDown(inputField, {key: 'Backspace' });

                    expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(screen.queryByText('hford1')).toBeInTheDocument();
                    expect(screen.queryByText('bford')).not.toBeInTheDocument();
                    // Delete hford1
                    inputField = screen.getByLabelText(/People with this permission can edit/);

                    fireEvent.keyDown(inputField, {key: 'Backspace' });
                    expect(screen.queryByText('hford1')).not.toBeInTheDocument();
                    expect(screen.queryByText('bford')).not.toBeInTheDocument();
                    expect(screen.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                });
            });
        });

        it('should show owners and editors for the space', async () => {
            await renderComponent( 'User_id');

            const ownerRow = within(await screen.findByTestId('userListItem__user_id'));
            ownerRow.getByText(/owner/i);
            ownerRow.getByText(/user_id/i);

            const editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            editorRow.getByText(/editor/i);
            editorRow.getByText(/user_id_2/i);
        });

        it('should change owner', async () => {
            await renderComponent( 'USER_ID');
            let editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const permissionButton = await editorRow.findByText(/owner/i);

            const user1 = {'userId': 'user_id', 'permission': 'editor'};
            const user2 = {'userId': 'user_id_2', 'permission': 'owner'};
            SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue([user1, user2])

            fireEvent.click(permissionButton);
            fireEvent.click(await screen.findByText(/yes/i));

            const expectedOwner = TestData.spaceMappingsArray[0];
            const expectedNewOwner = TestData.spaceMappingsArray[1];
            expect(SpaceClient.changeOwner).toHaveBeenCalledWith(TestData.space, expectedOwner, expectedNewOwner);

            const ownerRow = within(await screen.findByTestId('userListItem__user_id_2'));
            ownerRow.getByText(/owner/i);
            ownerRow.getByText(/user_id_2/i);

            editorRow = within(await screen.findByTestId('userListItem__user_id'));
            editorRow.getByText(/editor/i);
            editorRow.getByText(/user_id/i);
        });

        it('should not change owner after cancelling', async () => {
            await renderComponent( 'user_id');
            let editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            const editor = await editorRow.findByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const permissionButton = await editorRow.findByText(/owner/i);

            fireEvent.click(permissionButton);
            fireEvent.click(await screen.findByText(/no/i));
            expect(SpaceClient.changeOwner).not.toHaveBeenCalled();
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledTimes(1);

            editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            editorRow.getByText(/editor/i);
            editorRow.getByText(/user_id_2/i);

            const ownerRow = within(await screen.findByTestId('userListItem__user_id'));
            ownerRow.getByText(/owner/i);
            ownerRow.getByText(/user_id/i);
        });

        it('should not be able to change owner', async () => {
            await renderComponent( 'user_id_2');
            const editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            await waitFor(() => expect(editorRow.queryByText(/owner/i)).not.toBeInTheDocument());
        });

        it('should show a confirmation modal when removing self', async () => {
            const location = window.location;
            Reflect.deleteProperty(window, 'location');
            Object.defineProperty(window, 'location', {
                value: { pathname: '/' }, writable: true,
            });
            const currentUser = 'USER_ID_2';
            await renderComponent(currentUser);
            const editorRow = within(await screen.findByTestId(`userListItem__user_id_2`));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const removeEditorButton = await editorRow.findByText(/remove/i);
            fireEvent.click(removeEditorButton);

            await screen.findByText('Are you sure?');
            const confirmDeleteButton = await screen.findByTestId('confirmDeleteButton');
            fireEvent.click(confirmDeleteButton);

            await waitFor(() => expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestData.space, TestData.spaceMappingsArray[1]));
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
            await waitFor(() => expect(window.location.pathname).toBe('/user/dashboard'));
            window.location = location;
        });

        it('should show a confirmation modal when removing editor access', async () => {
            const currentUser = 'USER_ID';
            await renderComponent(currentUser);

            const editorRow = within(await screen.findByTestId(`userListItem__user_id_2`));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const removeEditorButton = await editorRow.findByText(/remove/i);
            fireEvent.click(removeEditorButton);

            await screen.findByText('Are you sure?');
            const confirmDeleteButton = await screen.findByText('Yes');
            fireEvent.click(confirmDeleteButton);

            await waitFor(async () => expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestData.space, TestData.spaceMappingsArray[1]));
            expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
        });

        it('should not open UserAccessList popup', async () => {
            await renderComponent();

            await waitFor(() => {
                expect(screen.queryByTestId('userAccess')).not.toBeInTheDocument();
            });
        });
    });
});

async function renderComponent(currentUser = 'User_id', currentSpace: Space = TestData.space): Promise<void> {
    renderWithRecoil(
        <InviteEditorsFormSection collapsed={false} />,
        ({set}) => {
            set(CurrentUserState, currentUser)
            set(CurrentSpaceState, currentSpace)
        }
    );
    await waitFor(() => expect(SpaceClient.getUsersForSpace).toHaveBeenCalled());
}

async function validateApiCall(userIds: string[]) {
    await waitFor(() => expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith(TestData.space, userIds));
}
