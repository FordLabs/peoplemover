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

import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import SpaceClient from '../Space/SpaceClient';
import React from 'react';
import {AvailableActions, AvailableModals} from '../Redux/Actions';
import configureStore from 'redux-mock-store';
import EditContributorsForm from './EditContributorsForm';

describe('Edit Access', () => {
    let app: RenderResult;
    const mockStore = configureStore([]);
    const expectedCurrentSpace = TestUtils.space;
    const expectedViewingDate = new Date(2020, 4, 14);
    const store = mockStore({
        currentSpace: expectedCurrentSpace,
        viewingDate: expectedViewingDate,
    });

    beforeEach(async () => {
        SpaceClient.inviteUsersToSpace = jest.fn().mockResolvedValue({});
        store.dispatch = jest.fn();
        await wait(async () => {
            app = renderWithRedux(
                <EditContributorsForm/>,
                store
            );
        });
    });

    it('should close Edit Contributors modal on click of Cancel button', async () => {
        await act(async () => {
            const cancelButton = await app.findByText('Cancel');
            fireEvent.click(cancelButton);
        });
        expect(store.dispatch).toHaveBeenCalledWith({
            type: AvailableActions.CLOSE_MODAL,
        });
    });

    it('should submit invited contributors, current space name, and access token on click of Invite button', async () => {
        await act(async () => {
            const usersToInvite = app.getByTestId('emailTextArea');
            fireEvent.change(usersToInvite, {target: {value: 'some1@email.com,some2@email.com,some3@email.com'}});

            const saveButton = await app.findByText('Invite');
            fireEvent.click(saveButton);
        });
        expect(SpaceClient.inviteUsersToSpace).toHaveBeenCalledWith(TestUtils.space, ['some1@email.com', 'some2@email.com', 'some3@email.com']);
        expect(store.dispatch).toHaveBeenCalledWith({
            type: AvailableActions.SET_CURRENT_MODAL,
            modal: AvailableModals.CONTRIBUTORS_CONFIRMATION,
            item: undefined,
        });
    });

    it('should reject invalid emails', async () => {
        const usersToInvite = app.getByTestId('emailTextArea');
        const saveButton = await app.findByText('Invite');

        expect(saveButton).toBeDisabled();

        fireEvent.change(usersToInvite, {target: {value: 'some1@email.com,some2@email.com,some3@email.com'}});

        expect(saveButton).toBeEnabled();

        fireEvent.change(usersToInvite, {target: {value: 'not-a-valid-email,some2@email.com,some3@email.com'}});

        expect(saveButton).toBeDisabled();
    });
});