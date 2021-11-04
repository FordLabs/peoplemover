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

import * as React from 'react';
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import TransferOwnershipForm from './TransferOwnershipForm';
import SpaceClient from '../Space/SpaceClient';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import {RenderResult} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import {closeModalAction} from '../Redux/Actions';
import {applyMiddleware, createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import thunk from 'redux-thunk';
import {fireEvent} from '@testing-library/dom';
import {AxiosResponse} from 'axios';

describe('Transfer Ownership Form', () => {
    let form: RenderResult;
    let store: Store;
    beforeEach(async () => {
        store = createStore(rootReducer, {currentUser: 'user_id'}, applyMiddleware(thunk));
        store.dispatch = jest.fn();
        SpaceClient.getUsersForSpace = jest.fn((uuid) => Promise.resolve(TestUtils.spaceMappingsArray as UserSpaceMapping[]));
        SpaceClient.changeOwner = jest.fn(() => Promise.resolve({} as AxiosResponse));
        SpaceClient.removeUser = jest.fn(() => Promise.resolve({} as AxiosResponse));
        await act(async () => {
            form = renderWithRedux(<TransferOwnershipForm space={TestUtils.space}/>, store);
        });
    });

    it('Should prompt the choice with the space name', () => {
        form.getByText('Please choose who you would like to be the new owner of ' + TestUtils.space.name);
    });

    it('should show each editors name', () => {
        form.getByText('user_id_2');
        expect(form.queryByText('user_id')).not.toBeInTheDocument();
    });

    it('should not allow submission before an editor is chosen (the modal does not close)', () => {
        form.getByText('Transfer ownership').click();
        expect(form.getByText(/Please choose who you would like/)).toBeInTheDocument();
    });

    it('should close the modal when cancel is clicked', () => {
        fireEvent.click(form.getByText('Cancel'));
        expect(store.dispatch).toBeCalledWith(closeModalAction());
    });

    describe('the happy path', () => {
        it('should close the modal when properly submitted', async () => {
            fireEvent.click(form.getByText('user_id_2'));
            await act(async () => {fireEvent.click(form.getByText('Transfer ownership'));});
            await expect(store.dispatch).toBeCalledWith(closeModalAction());
        });
        it('should use the Client to promote the selected editor to owner', () => {
            fireEvent.click(form.getByText('user_id_2'));
            fireEvent.click(form.getByText('Transfer ownership'));
            expect(SpaceClient.changeOwner).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[0], TestUtils.spaceMappingsArray[1]);
        });
        it('should use the Client to remove the current users permissions from the space', async () => {
            fireEvent.click(form.getByText('user_id_2'));
            await fireEvent.click(form.getByText('Transfer ownership'));
            expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestUtils.space, TestUtils.spaceMappingsArray[0]);
        });
    });
});

