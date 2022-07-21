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

import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {AuthenticatedRoute} from './AuthenticatedRoute';
import Cookies from 'universal-cookie';
import {RunConfig} from '../index';
import {MemoryRouter, Routes} from 'react-router-dom';
import {Route} from 'react-router';
import AccessTokenClient from '../Services/Api/AccessTokenClient';

const OAUTH_REDIRECT_SESSIONSTORAGE_KEY = 'oauth_redirect';
const accessToken = 'TOTALLY_REAL_ACCESS_TOKEN';

jest.mock('Services/Api/AccessTokenClient');

describe('AuthenticatedRoute.test.tsx', function() {
    let location: (string | Location) & Location;
    const childComponentText = 'Hello, Secured World!'

    beforeEach(() => {
        location = window.location;
        Reflect.deleteProperty(window, 'location');

        new Cookies().remove('accessToken');

        AccessTokenClient.validateAccessToken = jest.fn().mockResolvedValue({})
    });

    afterEach(() => {
        window.location = location;
    });

    describe('AuthenticatedRoute', () => {
        it('should display content when authenticated', async () => {
            renderComponent({authenticated: true, securityEnabled: true});
            await waitFor(() => expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(accessToken))

            expect(await screen.findByText(childComponentText)).toBeDefined();
        });

        it('should redirect to Auth provider when not Authenticated', async () => {
            window.location = {href: '', origin: 'http://localhost'} as Location;
            AccessTokenClient.validateAccessToken = jest.fn().mockRejectedValue({})

            renderComponent({authenticated: false, securityEnabled: true});
            await waitFor(() => expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(undefined))

            const route = 'https://totallyreal.endpoint/oauth/thing?client_id=urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa&resource=urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb&response_type=token&redirect_uri=http://localhost/adfs/catch';
            expect(window.location.href).toEqual(route);
        });

        it('should display content when security is disabled', async () => {
            renderComponent({authenticated: false, securityEnabled: false});
            expect(AccessTokenClient.validateAccessToken).not.toHaveBeenCalled();

            expect(await screen.findByText(childComponentText)).toBeDefined()
        });
    });

    describe('set oauth redirect pathname variable', () => {
        beforeEach(() => {
            sessionStorage.clear();
            AccessTokenClient.validateAccessToken = jest.fn().mockRejectedValue({})
            setRunConfig(true);
        });

        it('should set the appropriate space UUID in the ADFS redirect session storage variable', async () => {
            const pathname = '/01234567-0123-0123-0123-0123456789ab';
            setWindowHistoryAndRender(pathname);

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toEqual(pathname));
        });

        it('should not set the redirect URL to dashboard if no path has been set', async () => {
            setWindowHistoryAndRender('/');

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toBeFalsy());
        });

        it('should not reset the redirect URL to dashboard if the redirect URL has already been set', async () => {
            const expectedRedirect = '/expected-redirect';
            sessionStorage.setItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY, expectedRedirect);

            setWindowHistoryAndRender('/if-this-is-put-in-session-storage-the-test-should-fail');

            await waitFor(() => expect(sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)).toEqual(expectedRedirect));
        });
    });
});

function setWindowHistoryAndRender(pathname: string): void {
    window.location = {href: '', origin: 'http://localhost', pathname: pathname} as Location;
    renderAuthRoute(pathname);
}

function setRunConfig(securityEnabled: boolean): void {
    window.runConfig = {
        adfs_url_template: 'https://totallyreal.endpoint/oauth/thing?client_id=%s&resource=%s&response_type=token&redirect_uri=%s',
        adfs_client_id: 'urn:aaaaa_aaaaaa_aaaaaa:aaa:aaaa',
        adfs_resource: 'urn:bbbbbb_bbbb_bbbbbb:bbb:bbbb',
        auth_enabled: securityEnabled,
    } as RunConfig;
}

function renderAuthRoute(path: string): void {
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path={path} element={
                    <AuthenticatedRoute>
                        <div>Hello, Secured World!</div>
                    </AuthenticatedRoute>
                } />
            </Routes>
        </MemoryRouter>,
    );
}

function renderComponent({authenticated, securityEnabled}: ComponentState): void {
    setRunConfig(securityEnabled);
    if (authenticated) {
        new Cookies().set('accessToken', accessToken, {path: '/'});
    }

    renderAuthRoute('/secure');
}

interface ComponentState {
    authenticated: boolean;
    securityEnabled: boolean;
}
