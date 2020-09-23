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

import {Router} from 'react-router';
import * as React from 'react';
import {render, RenderResult, wait} from '@testing-library/react';
import {AuthenticatedRoute} from '../Auth/AuthenticatedRoute';
import {createMemoryHistory, MemoryHistory} from 'history';
import Cookies from 'universal-cookie';
import Axios, {AxiosResponse} from 'axios';
import {RunConfig} from '../index';

describe('AuthenticatedRoute', function() {
    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        new Cookies().remove('accessToken');
    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    it('should display content when authenticated', async () => {
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
        const component = renderComponent({authenticated: true}).component;

        await wait(() => {
            const result = component.queryByText('Hello, Secured World!');
            expect(result).not.toBeNull();
        });
    });

    it('should redirect to Auth provider when not Authenticated', async () => {
        Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
        window.location = {href: '', origin: 'http://localhost'} as Location;
        renderComponent({authenticated: false});
        const route = 'http://totallyreal.endpoint/oauth/thing?client_id=urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa&resource=urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb&response_type=token&redirect_uri=http://localhost/adfs/catch';

        await wait(() => {
            expect(window.location.href).toEqual(route);
        });
    });

    function renderComponent({authenticated}: ComponentState): RenderedComponent {
        const history = createMemoryHistory({ initialEntries: ['/secure'] });
        /* eslint-disable @typescript-eslint/camelcase */
        window.runConfig = {
            adfs_url_template: 'http://totallyreal.endpoint/oauth/thing?client_id=%s&resource=%s&response_type=token&redirect_uri=%s',
            adfs_client_id: 'urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa',
            adfs_resource: 'urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb',
        } as RunConfig;
        /* eslint-enable @typescript-eslint/camelcase */
        if (authenticated) {
            new Cookies().set('accessToken', 'TOTALLY_REAL_ACCESS_TOKEN', {path: '/'});
        }

        const component = render(
            <Router history={history}>
                <AuthenticatedRoute exact path={'/secure'}>
                    <div>Hello, Secured World!</div>
                </AuthenticatedRoute>
            </Router>
        );

        return {history, component};
    }

    interface ComponentState {
        authenticated: boolean;
    }

    interface RenderedComponent {
        history: MemoryHistory;
        component: RenderResult;
    }
});
