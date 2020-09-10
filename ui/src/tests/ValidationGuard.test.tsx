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

import {render, RenderResult, wait} from '@testing-library/react';
import AuthorizedRoute from '../Validation/AuthorizedRoute';
import * as React from 'react';
import Axios, {AxiosResponse} from 'axios';
import {Router} from 'react-router';
import {createMemoryHistory, MemoryHistory} from 'history';
import {RunConfig} from '../index';

describe('The Validation Guard', () => {
    it('should redirect to login when security is enabled and you are not authorized', async () => {
        Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
        let {history} = await renderComponent(true);
        expect(history.location.pathname).toEqual('/user/login');
    });

    it('should show the child element when security is enabled and you are authorized', async () => {
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
        let {result} = await renderComponent(true);
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
    });

    it('should show the child element when security is disabled', async () => {
        Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
        let {result} = await renderComponent(false);
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
        expect(Axios.post.mock.calls.length).toBe(0);
    });

    async function renderComponent(securityEnabled: boolean): Promise<{ result: RenderResult; history: MemoryHistory }> {
        // eslint-disable-next-line @typescript-eslint/camelcase
        window.runConfig = {auth_enabled: securityEnabled} as RunConfig;
        const history = createMemoryHistory({initialEntries: ['/user/dashboard']});

        // @ts-ignore
        let result: RenderResult = null;
        await wait(() => {
            result = render(
                <Router history={history}>
                    <AuthorizedRoute>
                        <TestComponent/>
                    </AuthorizedRoute>
                </Router>
            );
        });
        return {result, history};
    }

    function TestComponent(): JSX.Element {
        return <>I am so secure!</>;
    }
});
