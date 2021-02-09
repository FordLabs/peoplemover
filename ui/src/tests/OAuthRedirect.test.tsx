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

import {render} from '@testing-library/react';
import {OAuthRedirect, OAUTH_REDIRECT_DEFAULT, OAUTH_REDIRECT_KEY} from '../ReusableComponents/OAuthRedirect';
import * as React from 'react';
import {MemoryRouter, Router} from 'react-router';
import {createMemoryHistory} from 'history';
import Cookies from 'universal-cookie';

describe('OAuthRedirect', function() {
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

    it('should save access token', function() {
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        render(
            <MemoryRouter>
                <OAuthRedirect/>
            </MemoryRouter>
        );
        expect(new Cookies().get('accessToken')).toEqual(expectedToken);
    });

    it('should redirect to default page', function() {
        const expectedPathname = OAUTH_REDIRECT_DEFAULT;
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        const history = createMemoryHistory({ initialEntries: ['/login'] });

        render(
            <Router history={history}>
                <OAuthRedirect/>
            </Router>
        );
        expect(history.location.pathname).toEqual(expectedPathname);
    });

    it('should redirect to a provided space when the space is set in session storage', () => {
        const expectedPathname = '/CAFE8441-CAFE-ADEC-FADE-ABBAEDDABABE';
        const expectedToken = 'EXPECTED_TOKEN';
        window.location = {
            href: `http://localhost/#access_token=${expectedToken}`,
            hash: `#access_token=${expectedToken}`,
        } as Location;

        sessionStorage.setItem(OAUTH_REDIRECT_KEY, expectedPathname);

        const history = createMemoryHistory({ initialEntries: ['/login'] });

        render(
            <Router history={history}>
                <OAuthRedirect/>
            </Router>
        );
        expect(history.location.pathname).toEqual(expectedPathname);
        expect(sessionStorage.getItem(OAUTH_REDIRECT_KEY)).toBeFalsy();
    });
});
