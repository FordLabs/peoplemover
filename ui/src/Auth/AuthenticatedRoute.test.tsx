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

import {Router} from 'react-router';
import React from 'react';
import {render, RenderResult, screen, waitFor} from '@testing-library/react';
import {AuthenticatedRoute} from './AuthenticatedRoute';
import {createMemoryHistory, MemoryHistory} from 'history';
import Cookies from 'universal-cookie';
import Axios, {AxiosResponse} from 'axios';
import {RunConfig} from '../index';

const OAUTH_REDIRECT_SESSIONSTORAGE_KEY = 'oauth_redirect';

describe('AuthenticatedRoute', function() {
    let location: (string | Location) & Location;

    beforeEach(() => {
        location = window.location;
        Reflect.deleteProperty(window, 'location');

        new Cookies().remove('accessToken');
    });

    afterEach(() => {
        window.location = location;
    });

    it('should display content when authenticated', async () => {
        Axios.post = jest.fn().mockResolvedValue({});
        const component = renderComponent({authenticated: true, securityEnabled: true}).component;

        await waitFor(() => {
            const result = component.queryByText('Hello, Secured World!');
            expect(result).not.toBeNull();
        });
    });

    it('should redirect to Auth provider when not Authenticated', async () => {
        Axios.post = jest.fn().mockRejectedValue({});
        window.location = {href: '', origin: 'http://localhost'} as Location;
        renderComponent({authenticated: false, securityEnabled: true});
        const route = 'https://totallyreal.endpoint/oauth/thing?client_id=urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa&resource=urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb&response_type=token&redirect_uri=http://localhost/adfs/catch';

        await waitFor(() => {
            expect(window.location.href).toEqual(route);
        });
    });

    it('should display content when security is disabled', async () => {
        renderComponent({authenticated: false, securityEnabled: false});

        expect(await screen.findByText('Hello, Secured World!')).toBeDefined()
    });

    describe('set redirect pathname variable', () => {
        beforeEach(() => {
            sessionStorage.clear();
            Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
            setRunConfig(true);
        });

        it('should set the appropriate space UUID in the ADFS redirect session storage variable', async () => {
            let pathname = '/01234567-0123-0123-0123-0123456789ab';
            setWindowHistoryAndRender(pathname);

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toEqual(pathname));
        });

        it('should not set the redirect URL to dashboard if no path has been set', async () => {
            setWindowHistoryAndRender('/');

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toBeFalsy());
        });

        it('should not reset the redirect URL to dashboard if the redirect URL has already been set', async () => {
            let expectedRedirect = '/expected-redirect';
            sessionStorage.setItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY, expectedRedirect);

            setWindowHistoryAndRender('/if-this-is-put-in-session-storage-the-test-should-fail');

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toEqual(expectedRedirect));
        });

        function setWindowHistoryAndRender(pathname: string): void {
            window.location = {href: '', origin: 'http://localhost', pathname: pathname} as Location;
            renderAuthRoute(createMemoryHistory(), pathname);
        }
    });

    function setRunConfig(securityEnabled: boolean): void {
        window.runConfig = {
            adfs_url_template: 'https://totallyreal.endpoint/oauth/thing?client_id=%s&resource=%s&response_type=token&redirect_uri=%s',
            adfs_client_id: 'urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa',
            adfs_resource: 'urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb',
            auth_enabled: securityEnabled,
        } as RunConfig;
    }

    function renderAuthRoute(history: MemoryHistory, path: string):  RenderResult {
        return render(
            <Router history={history}>
                <AuthenticatedRoute exact path={path}>
                    <div>Hello, Secured World!</div>
                </AuthenticatedRoute>
            </Router>,
        );
    }

    function renderComponent({authenticated, securityEnabled}: ComponentState): RenderedComponent {
        const history = createMemoryHistory({ initialEntries: ['/secure'] });
        setRunConfig(securityEnabled);
        if (authenticated) {
            new Cookies().set('accessToken', 'TOTALLY_REAL_ACCESS_TOKEN', {path: '/'});
        }

        const component = renderAuthRoute(history, '/secure');

        return {history, component};
    }

    interface ComponentState {
        authenticated: boolean;
        securityEnabled: boolean;
    }

    interface RenderedComponent {
        history: MemoryHistory;
        component: RenderResult;
    }
});
