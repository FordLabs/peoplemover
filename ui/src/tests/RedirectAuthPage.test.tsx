/*
 * Copyright (c) 2019 Ford Motor Company
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
import RedirectAuthPage from '../ReusableComponents/RedirectAuthPage';
import {mount} from 'enzyme';
import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {wait} from '@testing-library/react';
import {Router} from 'react-router-dom';
import {createMemoryHistory} from 'history';

interface MockLocation { href: string }

describe('should redirect to login page', () => {
    process.env.REACT_APP_AUTHQUEST_CLIENT_ID = 'AQ:client-id';
    process.env.REACT_APP_AUTHQUEST_URL = 'https://authquest-url.com';
    process.env.REACT_APP_URL = 'http://localhost:8080/api/';

    const redirectUri = encodeURIComponent(window.location.href);
    const authquestClientID = encodeURIComponent(process.env.REACT_APP_AUTHQUEST_CLIENT_ID as string);

    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);

    });

    afterEach(() => {
        (window as Window) = originalWindow;
    });

    it('should redirect users to AuthQuest login page when hitting /login', () => {
        (window.location as MockLocation) = {
            href: 'http://localhost/',
        };

        mount(<RedirectAuthPage isSignup={false}/>);

        expect(window.location.href).toEqual(`${process.env.REACT_APP_AUTHQUEST_URL}/login?redirect_uri=${redirectUri}&client_id=${authquestClientID}`);
    });

    it('should redirect users to AuthQuest signup page when hitting /signup', () => {
        (window.location as MockLocation) = {
            href: 'http://localhost/',
        };

        mount(<RedirectAuthPage isSignup={true}/>);

        expect(window.location.href).toEqual(`${process.env.REACT_APP_AUTHQUEST_URL}/signup?redirect_uri=${redirectUri}&client_id=${authquestClientID}`);
    });

    it('should ask the backend for the accessToken if an access_code is in the url and store it in the cookies', async () => {
        Axios.post = jest.fn(() => Promise.resolve({
            data: {
                'access_token': 'TOKEN123',
            },
        } as AxiosResponse));

        (window.location as MockLocation) = {
            href: 'http://localhost?access_code=123ABC',
        };

        await wait( () => {
            const history = createMemoryHistory({ initialEntries: ['/login'] });

            mount(
                <Router history={history}>
                    <RedirectAuthPage isSignup={false} />
                </Router>
            );

        });

        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');

        expect(Axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_URL}access_token`, {accessCode: '123ABC'});
        expect(accessToken).toEqual('TOKEN123');

        cookies.remove('accessToken');
    });


    it('should check if accessToken is valid if one exists in the cookies', async () => {
        (window.location as MockLocation) = {
            href: 'http://localhost:8080/api/',
        };

        const fakeAccessToken = 'FAKE_TOKEN123';

        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken);

        const originalFunc = AccessTokenClient.validateAccessToken.bind({});

        AccessTokenClient.validateAccessToken = jest.fn(() => Promise.resolve({
            status: 200,
        } as AxiosResponse));

        const history = createMemoryHistory({ initialEntries: ['/login'] });

        await wait(() => {
            mount(
                <Router history={history}>
                    <RedirectAuthPage isSignup={false} />
                </Router>
            );
        });

        expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(fakeAccessToken);

        AccessTokenClient.validateAccessToken = originalFunc;
        cookies.remove('accessToken');
    });

    // We are trying to test setting and removing cookies on the root path only. The 'universal-cookies' library
    // we are using will make this test pass if cookies.remove is called with {path: '/'} or cookies.remove()
    // even though if cookies.remove() is called the implementation will fail.
    // Keep this in mind!
    it('should clear access_token from the cookies if the token is not valid', async () => {
        (window.location as MockLocation) = {
            href: 'http://localhost/',
        };

        const fakeAccessToken = 'INVALID_TOKEN';

        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken, {path: '/'});

        const originalFunc = AccessTokenClient.validateAccessToken.bind({});

        AccessTokenClient.validateAccessToken = jest.fn(() => Promise.reject({
            status: 403,
        } as AxiosResponse));

        const history = createMemoryHistory({ initialEntries: ['/login'] });

        await wait(() => {
            mount(
                <Router history={history}>
                    <RedirectAuthPage isSignup={false} />
                </Router>
            );
        });

        expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(fakeAccessToken);
        expect(cookies.get('accessToken')).toBeUndefined();

        AccessTokenClient.validateAccessToken = originalFunc;

        cookies.remove('accessToken');
    });


});
