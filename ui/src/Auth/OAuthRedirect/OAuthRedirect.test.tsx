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

import { render, screen } from '@testing-library/react';
import { OAuthRedirect } from './OAuthRedirect';
import React from 'react';
import { MemoryRouter } from 'react-router';
import Cookies from 'universal-cookie';

const OAUTH_REDIRECT_SESSIONSTORAGE_KEY = 'oauth_redirect';
const OAUTH_REDIRECT_DEFAULT = '/user/dashboard';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Navigate: ({ to }: { to: string }) => <div>Navigated to: {to}</div>,
}));

describe('OAuthRedirect', function () {
    let location: (string | Location) & Location;

    beforeEach(() => {
        location = window.location;
        Reflect.deleteProperty(window, 'location');

        new Cookies().remove('accessToken');

        sessionStorage.setItem(
            OAUTH_REDIRECT_SESSIONSTORAGE_KEY,
            '/user/dashboard'
        );
    });

    afterEach(() => {
        window.location = location;
    });

    it('should save access token', function () {
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        render(
            <MemoryRouter>
                <OAuthRedirect />
            </MemoryRouter>
        );
        expect(new Cookies().get('accessToken')).toEqual(expectedToken);
    });

    it('should redirect to a default fallback page if no session storage redirect has been set', async () => {
        sessionStorage.clear();
        const expectedPathname = OAUTH_REDIRECT_DEFAULT;
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        render(
            <MemoryRouter initialEntries={['/login']}>
                <OAuthRedirect />
            </MemoryRouter>
        );
        expect(
            await screen.findByText(`Navigated to: ${expectedPathname}`)
        ).toBeDefined();
    });

    it('should redirect to a provided space when the space is set in session storage', async () => {
        const expectedPathname = '/CAFE8441-CAFE-ADEC-FADE-ABBAEDDABABE';
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        sessionStorage.setItem(
            OAUTH_REDIRECT_SESSIONSTORAGE_KEY,
            expectedPathname
        );

        render(
            <MemoryRouter initialEntries={['/login']}>
                <OAuthRedirect />
            </MemoryRouter>
        );
        expect(
            await screen.findByText(`Navigated to: ${expectedPathname}`)
        ).toBeDefined();
        expect(
            sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY)
        ).toBeFalsy();
    });
});
