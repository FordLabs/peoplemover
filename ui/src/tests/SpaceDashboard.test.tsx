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
import SpaceDashboard from '../SpaceDashboard/SpaceDashboard';
import React from 'react';
import {renderWithRedux} from './TestUtils';
import {Router} from 'react-router';
import {createMemoryHistory, MemoryHistory} from 'history';
import {wait, fireEvent, RenderResult} from '@testing-library/react';
import {AxiosResponse} from 'axios';
import SpaceClient from '../SpaceDashboard/SpaceClient';
import moment from 'moment';

interface TestComponent {
    component: RenderResult;
    fakeAccessToken: string;
    cookies: Cookies;
    history: History;
}

describe('SpaceDashbord tests', () => {

    it('should display signout and not invite contributors in menu', async () => {
        const {component} = await createTestComponent();
        await fireEvent.click(component.getByTestId('editContributorsModal'));
        expect(component.queryByTestId('invite-members')).toBeNull();
        expect(component.queryByTestId('sign-out')).not.toBeNull();
    });

    it('should redirect to space when a space in the dashboard is clicked', async () => {
        const {component, fakeAccessToken, history} = await createTestComponent();

        const space1 = await component.findByText('Space1');
        await fireEvent.click(space1);

        expect(SpaceClient.getSpacesForUser).toHaveBeenCalledWith(fakeAccessToken);

        expect(history.location.pathname).toBe('/space1');
    });

    it('should display space name on a space', async () => {
        const {component} = await createTestComponent();
        expect(component.queryByText('Space1')).not.toBeNull();
    });

    it('should display space last modified date and time on a space', async () => {
        const {component} = await createTestComponent();
        const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('dddd, MMMM D, Y [at] h:mm a');
        expect(component.getByText(`Last modified ${localTime}`)).not.toBeNull();
    });

    it('should display today and last modified time on a space', async () => {
        Date.now = jest.fn(() => 1586887571000);
        const {component} = await createTestComponent();
        const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('h:mm a');
        expect(component.getByText(`Last modified today at ${localTime}`)).not.toBeNull();
    });

    const createTestComponent = async (): Promise<TestComponent> => {
        const fakeAccessToken = 'FAKE_TOKEN123';
        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken);
        const history = createMemoryHistory({initialEntries: ['/user/dashboard']});
        SpaceClient.getSpacesForUser = jest.fn(() => Promise.resolve({
            data: [{name: 'Space1', lastModifiedDate: '2020-04-14T18:06:11.791+0000'}],
        } as AxiosResponse));

        let component: any = null;
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
