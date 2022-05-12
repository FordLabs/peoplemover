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

import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import React from 'react';
import InviteEditorsFormSection from './InviteEditorsFormSection';
import {fireEvent, screen, act, within, waitFor} from '@testing-library/react';
import Axios from 'axios';
import Cookies from 'universal-cookie';
import SpaceClient from '../Space/SpaceClient';
import configureStore from 'redux-mock-store';
import RedirectClient from '../Utils/RedirectClient';
import {Space} from '../Space/Space';

describe('Invite Editors Form', function() {
    const cookies = new Cookies();
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        Axios.put = jest.fn().mockResolvedValue({});
        Axios.post = jest.fn().mockResolvedValue({});
        cookies.set('accessToken', '123456');
        RedirectClient.redirect = jest.fn();
    });

    describe('feature toggle enabled', () => {
        describe('add editors', () => {
            function renderComponent(): void {
                renderWithRedux(
                    <InviteEditorsFormSection collapsed={false}/>,
                    undefined,
                    {currentSpace: TestUtils.space, currentUser: 'User_id'}
                );
            }

            function renderComponentWithSpaceFromProps(): void {
                const space: Space = {
                    id: 2,
                    uuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    name: 'local testSpace',
                    lastModifiedDate: TestUtils.originDateString,
                    todayViewIsPublic: true,
                };

                renderWithRedux(
                    <InviteEditorsFormSection collapsed={false} space={space}/>,
                    undefined,
                    {currentSpace: TestUtils.space, currentUser: 'User_id'});
            }

            function validateApiCall(userIds: string[]): void {
                expect(Axios.post).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users`,
                    {userIds: userIds},
                    {
                        headers: {
                            Authorization: 'Bearer 123456',
                            'Content-Type': 'application/json',
                        },
                    },
                );
            }

            it('should render the local test space', async () => {
                renderComponentWithSpaceFromProps();
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: 'hford1'}});
                fireEvent.keyDown(inputField, {key: 'Enter', code: 'Enter'});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');

                await fireEvent.click(screen.getByTestId('inviteEditorsFormSubmitButton'));

                expect(Axios.post).toHaveBeenCalledWith(
                    `/api/spaces/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/users`,
                    {userIds: ['hford1']},
                    {
                        headers: {
                            Authorization: 'Bearer 123456',
                            'Content-Type': 'application/json',
                        },
                    },
                );
            });

            it('should add users as editors', async function() {
                renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: 'hford1'}});
                fireEvent.keyDown(inputField, {key: 'Enter', code: 'Enter'});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');

                await fireEvent.click(screen.getByTestId('inviteEditorsFormSubmitButton'));

                validateApiCall(['hford1']);
            });

            it('should not add invalid cdsid user as editor', async function() {
                renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                fireEvent.change(screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: '#ford'}});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('#ford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();

                await fireEvent.click(submitButton);
                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should not add invalid cdsid user as editor (on Enter)', async function() {
                renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                const inputField = screen.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField,
                    {target: {value: '#ford'}});
                fireEvent.keyDown(inputField, {key: 'Enter'});
                fireEvent.blur(inputField);

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('#ford');

                screen.getByText(/Please enter a valid CDSID/);

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                await fireEvent.click(submitButton);

                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should not add users as editors when one of them is invalid', async function() {
                renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                fireEvent.change(screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, #ford'}});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');
                screen.getByText('#ford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                await fireEvent.click(submitButton);

                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should add two users as editors when both are valid', async function() {
                renderComponent();
                await screen.findByText('Enter CDSID of your editors');
                await fireEvent.change(screen.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, bford'}});

                expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                screen.getByText('hford1');
                screen.getByText('bford');

                const submitButton = screen.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).not.toBeDisabled();
                expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                await fireEvent.click(submitButton);

                validateApiCall(['hford1', 'bford']);
            });

            describe('Submit Button and Error Message', () => {
                it('should be disabled/disabled when there is no input', async () => {
                    await act( async () => {
                        renderComponent();
                        expect(screen.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                        expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                        expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    });
                });

                it('should be enabled when there are entries, and disabled when there are none', async () => {
                    renderComponent();
                    let inputField: HTMLElement;
                    expect(screen.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    await screen.findByText('Enter CDSID of your editors');
                    await act( async () => {
                        fireEvent.change(screen.getByLabelText(/People with this permission can edit/),
                            {target: {value: 'hford1, bford'}});
                    });
                    expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(screen.queryByText('hford1')).toBeInTheDocument();
                    expect(screen.queryByText('bford')).toBeInTheDocument();
                    // Delete bford
                    inputField = screen.getByLabelText(/People with this permission can edit/);
                    await act( async () => {
                        fireEvent.keyDown(inputField, {key: 'Backspace' });
                    });
                    expect(screen.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(screen.queryByText('hford1')).toBeInTheDocument();
                    expect(screen.queryByText('bford')).not.toBeInTheDocument();
                    // Delete hford1
                    inputField = screen.getByLabelText(/People with this permission can edit/);
                    await act( async () => {
                        fireEvent.keyDown(inputField, {key: 'Backspace' });
                    });
                    expect(screen.queryByText('hford1')).not.toBeInTheDocument();
                    expect(screen.queryByText('bford')).not.toBeInTheDocument();
                    expect(screen.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(screen.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(screen.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                });
            });
        });

        it('should show owners and editors for the space', async () => {
            await act(async () => {
                renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space, currentUser: 'User_id'});


                const ownerRow = within(await screen.findByTestId('userListItem__user_id'));
                ownerRow.getByText(/owner/i);
                ownerRow.getByText(/user_id/i);

                const editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
                editorRow.getByText(/editor/i);
                editorRow.getByText(/user_id_2/i);
            });
        });

        it('should change owner', async () => {
            renderWithRedux(
                <InviteEditorsFormSection/>, undefined, {
                    currentSpace: TestUtils.space,
                    currentUser: 'USER_ID',
                });
            let editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const permissionButton = await editorRow.findByText(/owner/i);

            SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
                [{'userId': 'user_id', 'permission': 'editor'}, {'userId': 'user_id_2', 'permission': 'owner'}]
            )

            fireEvent.click(permissionButton);
            fireEvent.click(await screen.findByText(/yes/i));
            expect(Axios.put).toHaveBeenCalledWith(
                `/api/spaces/${TestUtils.space.uuid}/users/user_id_2`,
                null,
                {headers: {Authorization: 'Bearer 123456'}},
            );

            const ownerRow = within(await screen.findByTestId('userListItem__user_id_2'));
            ownerRow.getByText(/owner/i);
            ownerRow.getByText(/user_id_2/i);

            editorRow = within(await screen.findByTestId('userListItem__user_id'));
            editorRow.getByText(/editor/i);
            editorRow.getByText(/user_id/i);
        });

        it('should not change owner after cancelling', async () => {
            renderWithRedux(
                <InviteEditorsFormSection/>, undefined, {
                    currentSpace: TestUtils.space,
                    currentUser: 'user_id',
                });
            let editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            const editor = editorRow.getByText(/editor/i);
            fireEvent.keyDown(editor, {key: 'ArrowDown'});
            const permissionButton = await editorRow.findByText(/owner/i);

            fireEvent.click(permissionButton);
            fireEvent.click(await screen.findByText(/no/i));
            expect(Axios.put).not.toHaveBeenCalled();
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledTimes(1);

            editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
            editorRow.getByText(/editor/i);
            editorRow.getByText(/user_id_2/i);

            const ownerRow = within(await screen.findByTestId('userListItem__user_id'));
            ownerRow.getByText(/owner/i);
            ownerRow.getByText(/user_id/i);
        });

        it('should not be able to change owner', async () => {
            await act(async () => {
                renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {
                        currentSpace: TestUtils.space,
                        currentUser: 'user_id_2',
                    });
                const editorRow = within(await screen.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                await waitFor(() => {
                    expect(editorRow.queryByText(/owner/i)).not.toBeInTheDocument();
                });
            });
        });

        it('should show a confirmation modal when removing self', async () => {
            await act(async () => {
                const currentUser = 'USER_ID_2';
                const mockStore = configureStore([]);
                const store = mockStore({
                    currentSpace: TestUtils.space,
                    viewingDate: new Date(2020, 4, 14),
                    currentUser: currentUser,
                });
                renderWithRedux(
                    <InviteEditorsFormSection/>, store, undefined);
                const editorRow = within(await screen.findByTestId(`userListItem__user_id_2`));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const removeEditorButton = await editorRow.findByText(/remove/i);
                await fireEvent.click(removeEditorButton);

                await screen.findByText('Are you sure?');
                const confirmDeleteButton = await screen.findByTestId('confirmDeleteButton');
                fireEvent.click(confirmDeleteButton);
                await waitFor(() => {
                    expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[1]);
                    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
                    expect(RedirectClient.redirect).toHaveBeenCalledWith('/user/dashboard');

                });
            });
        });

        it('should show a confirmation modal when removing editor access', async () => {
            await act(async () => {
                const currentUser = 'USER_ID';
                const mockStore = configureStore([]);
                const store = mockStore({
                    currentSpace: TestUtils.space,
                    viewingDate: new Date(2020, 4, 14),
                    currentUser: currentUser,
                });

                renderWithRedux(
                    <InviteEditorsFormSection/>, store, undefined);

                const editorRow = within(await screen.findByTestId(`userListItem__user_id_2`));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const removeEditorButton = await editorRow.findByText(/remove/i);
                await fireEvent.click(removeEditorButton);

                await screen.findByText('Are you sure?');
                const confirmDeleteButton = await screen.findByText('Yes');
                fireEvent.click(confirmDeleteButton);

                await waitFor(async () => {
                    expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[1]);
                    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
                });
            });
        });

        it('should not open UserAccessList popup', async () => {
            await act(async () => {
                renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space, currentUser: 'User_id'});

                await waitFor(() => {
                    expect(screen.queryByTestId('userAccess')).not.toBeInTheDocument();
                });
            });
        });
    });
});
