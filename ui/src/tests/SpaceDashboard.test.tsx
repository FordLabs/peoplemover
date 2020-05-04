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

import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import SpaceDashboard from '../SpaceDashboard/SpaceDashboard';
import React from 'react';
import {renderWithRedux} from './TestUtils';
import {Router} from 'react-router';
import {createMemoryHistory} from 'history';
import {wait, fireEvent, RenderResult} from '@testing-library/react';
import {AxiosResponse} from 'axios';
import SpaceClient from '../SpaceDashboard/SpaceClient';
import moment from 'moment-timezone';

interface TestComponent {
    component: RenderResult;
    fakeAccessToken: string;
    cookies: Cookies;
    history: any;
}

describe('SpaceDashbord tests', () => {

    it('should redirect page to login page if token is invalid ', async () => {
        const {fakeAccessToken, history} = await createTestComponent(false);
        expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(fakeAccessToken);
        expect(history.location.pathname).toBe('/user/login');
    });

    it('should render space dashboard page if token is valid', async () => {
        const {fakeAccessToken, history} = await createTestComponent();
        expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(fakeAccessToken);
        expect(history.location.pathname).toBe('/user/dashboard');
    });

    it('should redirect to space when a space in the dashboard is clicked', async () => {
        const {component, fakeAccessToken, history} = await createTestComponent();

        const space1 = await component.findByText('Space1');
        await fireEvent.click(space1);

        expect(AccessTokenClient.validateAccessToken).toHaveBeenCalledWith(fakeAccessToken);
        expect(SpaceClient.getSpacesForUser).toHaveBeenCalledWith(fakeAccessToken);

        expect(history.location.pathname).toBe('/space1');
    });

    it('should display space name on a space', async () => {
        const {component} = await createTestComponent();
        expect(component.queryByText("Space1")).not.toBeNull();
    });

    describe('timezone dependent checks', () => {
        beforeEach(() => {
            moment.tz.setDefault('GMT');
        });

        afterEach(() => {
            moment.tz.setDefault();
        });

        it('should display space last modified date and time on a space', async () => {
            const {component} = await createTestComponent();
            expect(component.getByText('Last modified Tuesday, April 14, 2020 at 6:06 pm')).not.toBeNull();
        });

        it('should display today and last modified time on a space', async () => {
            Date.now = jest.fn(() => 1586887571000);
            const {component} = await createTestComponent();
            expect(component.getByText('Last modified today at 6:06 pm')).not.toBeNull();
        });
    });

    const createTestComponent = async (tokenValid = true): Promise<TestComponent> => {
        const fakeAccessToken = 'FAKE_TOKEN123';
        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken);
        const history = createMemoryHistory({initialEntries: ['/user/dashboard']});
        SpaceClient.getSpacesForUser = jest.fn(() => Promise.resolve({
            data: [{name: 'Space1', lastModifiedDate: '2020-04-14T18:06:11.791+0000'}],
        } as AxiosResponse));

        if (tokenValid) {
            AccessTokenClient.validateAccessToken = jest.fn(() => Promise.resolve({status: 200} as AxiosResponse));
        } else {
            AccessTokenClient.validateAccessToken = jest.fn(() => Promise.reject());
        }

        let component: RenderResult;
        await wait(() => {
            component = renderWithRedux(
                <Router history={history}>
                    <SpaceDashboard/>
                </Router>
            );
        });

        return {component, fakeAccessToken, cookies, history};
    };
});
