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

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import InviteEditorsFormSection from './InviteEditorsFormSection';
import {GlobalStateProps} from '../Redux/Reducers';
import {fireEvent, wait} from '@testing-library/dom';
import {act} from 'react-dom/test-utils';
import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import {RenderResult, within} from '@testing-library/react';
import SpaceClient from '../Space/SpaceClient';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import configureStore from 'redux-mock-store';
import PeopleClient from '../People/PeopleClient';
import RedirectClient from '../Utils/RedirectClient';

describe('Invite Editors Form', function() {
    const cookies = new Cookies();
    beforeEach(() => {
        TestUtils.mockClientCalls();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse)) as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse)) as any;
        cookies.set('accessToken', '123456');
        RedirectClient.redirect = jest.fn();
    });

    describe('feature toggle enabled', () => {
        describe('add editors', () => {
            function renderComponent(): RenderResult {
                return renderWithRedux(
                    <InviteEditorsFormSection collapsed={false}/>,
                    undefined,
                    {currentSpace: TestUtils.space} as GlobalStateProps);
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

            it('should add users as editors', async function() {
                const component = renderComponent();
                await component.findByText('Enter CDSID of your editors');
                const inputField = component.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField, {target: {value: 'hford1'}});
                fireEvent.keyDown(inputField, {key: 'Enter', code: 'Enter'});

                expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                component.getByText('hford1');

                await fireEvent.click(component.getByTestId('inviteEditorsFormSubmitButton'));

                validateApiCall(['hford1']);
            });

            it('should not add invalid cdsid user as editor', async function() {
                const component = renderComponent();
                await component.findByText('Enter CDSID of your editors');
                fireEvent.change(component.getByLabelText(/People with this permission can edit/),
                    {target: {value: '#ford'}});

                expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                component.getByText('#ford');

                const submitButton = component.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(component.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();

                await fireEvent.click(submitButton);
                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should not add invalid cdsid user as editor (on Enter)', async function() {
                const component = renderComponent();
                await component.findByText('Enter CDSID of your editors');
                const inputField = component.getByLabelText(/People with this permission can edit/);
                fireEvent.change(inputField,
                    {target: {value: '#ford'}});
                fireEvent.keyDown(inputField, {key: 'Enter'});
                fireEvent.blur(inputField);

                expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                component.getByText('#ford');

                component.getByText(/Please enter a valid CDSID/);

                const submitButton = component.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(component.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                await fireEvent.click(submitButton);

                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should not add users as editors when one of them is invalid', async function() {
                const component = renderComponent();
                await component.findByText('Enter CDSID of your editors');
                fireEvent.change(component.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, #ford'}});

                expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                component.getByText('hford1');
                component.getByText('#ford');

                const submitButton = component.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).toHaveAttribute('disabled');
                expect(component.queryByTestId('inviteEditorsFormErrorMessage')).toBeInTheDocument();
                await fireEvent.click(submitButton);

                expect(Axios.post).not.toHaveBeenCalled();
            });

            it('should add two users as editors when both are valid', async function() {
                const component = renderComponent();
                await component.findByText('Enter CDSID of your editors');
                await fireEvent.change(component.getByLabelText(/People with this permission can edit/),
                    {target: {value: 'hford1, bford'}});

                expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                component.getByText('hford1');
                component.getByText('bford');

                const submitButton = component.getByTestId('inviteEditorsFormSubmitButton');
                expect(submitButton).not.toBeDisabled();
                expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                await fireEvent.click(submitButton);

                validateApiCall(['hford1', 'bford']);
            });

            describe('Submit Button and Error Message', () => {
                it('should be disabled/disabled when there is no input', async () => {
                    await act( async () => {
                        const component = renderComponent();
                        expect(component.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                        expect(component.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                        expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    });
                });

                it('should be enabled when there are entries, and disabled when there are none', async () => {
                    const component = renderComponent();
                    let inputField: HTMLElement;
                    expect(component.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(component.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    await component.findByText('Enter CDSID of your editors');
                    await act( async () => {
                        await fireEvent.change(component.getByLabelText(/People with this permission can edit/),
                            {target: {value: 'hford1, bford'}});
                    });
                    expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(component.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(component.queryByText('hford1')).toBeInTheDocument();
                    expect(component.queryByText('bford')).toBeInTheDocument();
                    // Delete bford
                    inputField = component.getByLabelText(/People with this permission can edit/);
                    await act( async () => {
                        await fireEvent.keyDown(inputField, {key: 'Backspace' });
                    });
                    expect(component.queryByText('Enter CDSID of your editors')).not.toBeInTheDocument();
                    expect(component.getByTestId('inviteEditorsFormSubmitButton')).toBeEnabled();
                    expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                    expect(component.queryByText('hford1')).toBeInTheDocument();
                    expect(component.queryByText('bford')).not.toBeInTheDocument();
                    // Delete hford1
                    inputField = component.getByLabelText(/People with this permission can edit/);
                    await act( async () => {
                        await fireEvent.keyDown(inputField, {key: 'Backspace' });
                    });
                    expect(component.queryByText('hford1')).not.toBeInTheDocument();
                    expect(component.queryByText('bford')).not.toBeInTheDocument();
                    expect(component.queryByText('Enter CDSID of your editors')).toBeInTheDocument();
                    expect(component.getByTestId('inviteEditorsFormSubmitButton')).toBeDisabled();
                    expect(component.queryByTestId('inviteEditorsFormErrorMessage')).not.toBeInTheDocument();
                });
            });
        });

        it('should show owners and editors for the space', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);


                const ownerRow = within(await component.findByTestId('userListItem__user_id'));
                ownerRow.getByText(/owner/i);
                ownerRow.getByText(/user_id/i);

                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                editorRow.getByText(/editor/i);
                editorRow.getByText(/user_id_2/i);
            });
        });

        it('should remove user', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const removeButton = await component.findByText(/remove/i);

                SpaceClient.getUsersForSpace = jest.fn().mockReturnValueOnce(Promise.resolve(
                    [{'userId': 'user_id', 'permission': 'owner'}] as UserSpaceMapping[]));

                await fireEvent.click(removeButton);
                expect(PeopleClient.removePerson).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[1]);
                await wait(() => {
                    expect(component.queryByText('user_id_2')).not.toBeInTheDocument();
                    expect(component.queryByText(/^Editor$/)).not.toBeInTheDocument();
                });
            });
        });

        it('should change owner', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {
                        currentSpace: TestUtils.space,
                        currentUser: 'user_id',
                    } as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const permissionButton = await editorRow.findByText(/owner/i);

                SpaceClient.getUsersForSpace = jest.fn().mockReturnValueOnce(Promise.resolve(
                    [{'userId': 'user_id', 'permission': 'editor'}, {
                        'userId': 'user_id_2',
                        'permission': 'owner',
                    }] as UserSpaceMapping[]));

                await fireEvent.click(permissionButton);
                await fireEvent.click(await component.findByText(/yes/i));
                expect(Axios.put).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users/user_id_2`,
                    null,
                    {headers: {Authorization: 'Bearer 123456'}},
                );

                await wait(async () => {
                    const ownerRow = within(await component.findByTestId('userListItem__user_id_2'));
                    ownerRow.getByText(/owner/i);
                    ownerRow.getByText(/user_id_2/i);

                    const editorRow = within(await component.findByTestId('userListItem__user_id'));
                    editorRow.getByText(/editor/i);
                    editorRow.getByText(/user_id/i);
                });
            });
        });

        it('should not change owner after cancelling', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {
                        currentSpace: TestUtils.space,
                        currentUser: 'user_id',
                    } as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const permissionButton = await editorRow.findByText(/owner/i);

                await fireEvent.click(permissionButton);
                await fireEvent.click(await component.findByText(/no/i));
                expect(Axios.put).not.toHaveBeenCalled();
                expect(SpaceClient.getUsersForSpace).toHaveBeenCalledTimes(1);

                await wait(async () => {
                    const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                    editorRow.getByText(/editor/i);
                    editorRow.getByText(/user_id_2/i);

                    const ownerRow = within(await component.findByTestId('userListItem__user_id'));
                    ownerRow.getByText(/owner/i);
                    ownerRow.getByText(/user_id/i);
                });
            });
        });

        it('should not be able to change owner', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {
                        currentSpace: TestUtils.space,
                        currentUser: 'user_id_2',
                    } as GlobalStateProps);
                const editorRow = within(await component.findByTestId('userListItem__user_id_2'));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                await wait(() => {
                    expect(editorRow.queryByText(/owner/i)).not.toBeInTheDocument();
                });
            });
        });

        it('should show a confirmation modal when removing self', async () => {
            await act(async () => {
                let currentUser = 'user_id_2';
                const mockStore = configureStore([]);
                const store = mockStore({
                    currentSpace: TestUtils.space,
                    viewingDate: new Date(2020, 4, 14),
                    currentUser: currentUser,
                });
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, store, undefined);
                const editorRow = within(await component.findByTestId(`userListItem__${currentUser}`));
                const editor = editorRow.getByText(/editor/i);
                fireEvent.keyDown(editor, {key: 'ArrowDown'});
                const removeEditorButton = await editorRow.findByText(/remove/i);
                await fireEvent.click(removeEditorButton);

                await component.findByText('Are you sure?');
                const confirmDeleteButton = await component.findByTestId('confirmDeleteButton');
                fireEvent.click(confirmDeleteButton);
                await wait(() => {
                    expect(PeopleClient.removePerson).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[1]);
                    expect(component.queryByText('Are you sure?')).not.toBeInTheDocument();
                    expect(RedirectClient.redirect).toHaveBeenCalledWith('/user/dashboard');

                });
            });
        });

        it('should not open UserAccessList popup', async () => {
            await act(async () => {
                const component = renderWithRedux(
                    <InviteEditorsFormSection/>, undefined, {currentSpace: TestUtils.space} as GlobalStateProps);

                await wait(() => {
                    expect(component.queryByTestId('userAccess')).not.toBeInTheDocument();
                });
            });
        });
    });
});
