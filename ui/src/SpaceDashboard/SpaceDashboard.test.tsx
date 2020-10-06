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

import Cookies from 'universal-cookie';
import SpaceDashboard from './SpaceDashboard';
import React from 'react';
import {renderWithRedux} from '../tests/TestUtils';
import {Router} from 'react-router';
import {createMemoryHistory, MemoryHistory} from 'history';
import {wait, fireEvent, RenderResult} from '@testing-library/react';
import {AxiosResponse} from 'axios';
import SpaceClient from '../Space/SpaceClient';
import moment from 'moment';
import {RunConfig} from '../index';
import {createEmptySpace} from '../Space/Space';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {setCurrentSpaceAction} from '../Redux/Actions';

describe('SpaceDashboard', () => {
    it('should reset currentSpace on load', () => {
        let store = createStore(rootReducer, {});
        store.dispatch = jest.fn();
        renderWithRedux(<SpaceDashboard/>, store);

        expect(store.dispatch).toHaveBeenCalledWith(setCurrentSpaceAction(createEmptySpace()));
    });

    it('should display sign out and not invite contributors in menu', async () => {
        // eslint-disable-next-line @typescript-eslint/camelcase
        window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;
        const {component} = await createTestComponent();
        await fireEvent.click(component.getByTestId('accountDropdownToggle'));
        expect(component.queryByTestId('share-access')).toBeNull();
        expect(component.queryByTestId('sign-out')).not.toBeNull();
    });

    describe('if spaces are present', () => {
        let component: RenderResult;
        let fakeAccessToken: string;
        let history: MemoryHistory;

        beforeEach(async () => {
            ({component, fakeAccessToken, history} = await createTestComponent());
        });

        it('should redirect to space when a space in the dashboard is clicked', async () => {
            const space1 = await component.findByText('Space1');
            await fireEvent.click(space1);
            expect(SpaceClient.getSpacesForUser).toHaveBeenCalled();
            expect(history.location.pathname).toBe('/SpaceUUID');
        });

        it('should display space name on a space', async () => {
            expect(component.queryByText('Space1')).not.toBeNull();
        });

        it('should display space last modified date and time on a space', async () => {
            const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('dddd, MMMM D, Y [at] h:mm a');
            expect(component.getByText(`Last modified ${localTime}`)).not.toBeNull();
        });

        it('should display today and last modified time on a space', async () => {
            Date.now = jest.fn(() => 1586887571000);
            const {component} = await createTestComponent();
            const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('h:mm a');
            expect(component.getByText(`Last modified today at ${localTime}`)).not.toBeNull();
        });

        it('should NOT show welcome message if no spaces are present', async () => {
            expect(component.queryByText(`Welcome to PeopleMover!`)).toBeNull();
        });

        it('should show "Create New Space" button', async () => {
            await component.findByText(`Create New Space`);
        });
    });

    describe('if no spaces are present', () => {
        let component: RenderResult;

        beforeEach(async () => {
            ({component} = await createTestComponent(false));
        });

        it('should show welcome message', async () => {
            await component.findByText(`Welcome to PeopleMover!`);
        });

        it('should show "Create New Space" button', async () => {
            await component.findByText(`Create New Space`);
        });
    });

    const createTestComponent = async (hasSpaces = true): Promise<{
        component: RenderResult;
        fakeAccessToken: string;
        cookies: Cookies;
        history: MemoryHistory;
    }> => {
        const fakeAccessToken = 'FAKE_TOKEN123';
        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken);
        const history = createMemoryHistory({initialEntries: ['/user/dashboard']});
        const responseData = hasSpaces ? [{name: 'Space1', uuid: 'SpaceUUID', lastModifiedDate: '2020-04-14T18:06:11.791+0000'}] : [];
        SpaceClient.getSpacesForUser = jest.fn(() => Promise.resolve({ data: responseData } as AxiosResponse));

        // @ts-ignore
        let component: RenderResult = null;
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
