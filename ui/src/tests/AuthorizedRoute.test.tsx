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

import {RenderResult, waitFor} from '@testing-library/react';
import AuthorizedRoute from '../Auth/AuthorizedRoute';
import * as React from 'react';
import Axios, {AxiosError} from 'axios';
import {createMemoryHistory, MemoryHistory} from 'history';
import {RunConfig} from '../index';
import {renderWithRedux} from './TestUtils';
import {createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import {setIsReadOnlyAction} from '../Redux/Actions';
import {Router} from 'react-router-dom';

describe('Authorized Route', () => {
    let store: Store;

    it('should redirect to login when security is enabled and you are not authenticated', async () => {
        window.runConfig = {auth_enabled: true} as RunConfig;
        Axios.post = jest.fn().mockRejectedValue({response: {status: 401}});
        let {history} = await renderComponent(true);
        expect(history.location.pathname).toEqual('/user/login');
    });

    it('should show the child element when security is enabled and you are authenticated and authorized', async () => {
        window.runConfig = {auth_enabled: true} as RunConfig;
        Axios.post = jest.fn().mockResolvedValue({});
        let {result} = await renderComponent(true);
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
        expect(store.dispatch).toHaveBeenCalledWith(setIsReadOnlyAction(false));
    });

    it('should show the child element when security is enabled and you are authenticated but not authorized (read only)', async () => {
        Axios.post = jest.fn(() => Promise.reject({response: {status: 403}} as AxiosError));
        let {result} = await renderComponent(true);
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
        expect(store.dispatch).toHaveBeenCalledWith(setIsReadOnlyAction(true));
    });

    it('should show 404 page when security is enabled and space uuid does not exist', async () => {
        Axios.post = jest.fn(() => Promise.reject({response: {status: 404}} as AxiosError));
        let {history} = await renderComponent(true);
        expect(history.location.pathname).toEqual('/error/404');
        expect(store.dispatch).toHaveBeenCalledWith(setIsReadOnlyAction(true));
    });


    it('should show the child element when security is disabled', async () => {
        Axios.post = jest.fn().mockRejectedValue({});
        let {result} = await renderComponent(false);
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
        expect(store.dispatch).toHaveBeenCalledWith(setIsReadOnlyAction(false));
        // @ts-ignore
        expect(Axios.post.mock.calls.length).toBe(0);
    });

    async function renderComponent(securityEnabled: boolean): Promise<{ result: RenderResult; history: MemoryHistory }> {
        window.runConfig = {auth_enabled: securityEnabled} as RunConfig;
        const history = createMemoryHistory({initialEntries: ['/user/dashboard']});

        store = createStore(rootReducer, {});
        store.dispatch = jest.fn();

        // @ts-ignore
        let result: RenderResult = null;

        await waitFor(() => {
            result = renderWithRedux(
                <Router history={history}>
                    <AuthorizedRoute>
                        <TestComponent/>
                    </AuthorizedRoute>
                </Router>,
                store
            );
        });

        return {result, history};
    }

    function TestComponent(): JSX.Element {
        return <>I am so secure!</>;
    }
});
