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

import Cookies from 'universal-cookie';
import SpaceDashboard from './SpaceDashboard';
import React from 'react';
import {renderWithRecoil} from '../Utils/TestUtils';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import SpaceClient from '../Services/Api/SpaceClient';
import moment from 'moment';
import {createEmptySpace, Space} from 'Types/Space';
import {MemoryRouter} from 'react-router-dom';
import {RecoilObserver} from '../Utils/RecoilObserver';
import {ViewingDateState} from '../State/ViewingDateState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import TestData from '../Utils/TestData';

class MockDate extends Date {
    constructor() {
        super('2020-05-14T11:01:58.135Z');
    }
}

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

jest.mock('Services/Api/SpaceClient');

describe('SpaceDashboard', () => {
    describe('Resetting Space Date', () => {
        const tempDate = Date;

        beforeEach(() => {
            global.Date = MockDate as DateConstructor;
        });

        afterEach(() => {
            global.Date = tempDate;
        });

        it('should reset current date on load', async () => {
            let actualViewingDate: Date;

            renderWithRecoil(
                <MemoryRouter>
                    <RecoilObserver
                        recoilState={ViewingDateState}
                        onChange={(value: Date) => {
                            actualViewingDate = value;
                        }}
                    />
                    <SpaceDashboard/>
                </MemoryRouter>,
            );

            await waitFor(() =>
                expect(actualViewingDate).toEqual(new Date('Date is overwritten so anything returns the same date'))
            );
        });
    });

    it('should reset currentSpace on load', async () => {
        let currentSpace = TestData.space;
        renderWithRecoil(
            <MemoryRouter>
                <RecoilObserver
                    recoilState={CurrentSpaceState}
                    onChange={(value: Space) => {
                        currentSpace = value;
                    }}
                />
                <SpaceDashboard/>
            </MemoryRouter>,
            ({set}) => {
                set(CurrentSpaceState, TestData.space)
            }
        );

        await waitFor(() => expect(currentSpace).toEqual(createEmptySpace()));
    });

    describe('if spaces are present', () => {
        beforeEach(async () => {
            await createTestComponent();
        });

        it('should redirect to space when a space in the dashboard is clicked', async () => {
            const space1 = await screen.findByText('Space1');
            fireEvent.click(space1);
            expect(SpaceClient.getSpacesForUser).toHaveBeenCalled();
            expect(mockedUsedNavigate).toHaveBeenCalledWith('/SpaceUUID');
        });

        it('should display space name on a space', async () => {
            expect(screen.queryByText('Space1')).not.toBeNull();
        });

        it('should display space last modified date and time on a space', async () => {
            const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('dddd, MMMM D, Y [at] h:mm a');
            expect(screen.getByText(`Last modified ${localTime}`)).not.toBeNull();
        });

        it('should display today and last modified time on a space', async () => {
            Date.now = jest.fn(() => 1586887571000);
            await createTestComponent();
            const localTime = moment.utc('2020-04-14T18:06:11.791+0000').local().format('h:mm a');
            expect(await screen.findByText(`Last modified today at ${localTime}`)).not.toBeNull();
        });

        it('should NOT show welcome message if no spaces are present', async () => {
            expect(screen.queryByText(`Welcome to PeopleMover!`)).toBeNull();
        });

        it('should show "Create New Space" button', async () => {
            await screen.findByText(`Create New Space`);
        });
    });

    describe('if no spaces are present', () => {
        beforeEach(async () => {
            await createTestComponent(false);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('should show welcome message', async () => {
            await screen.findByText(`Welcome to PeopleMover!`);
        });

        it('should show "Create New Space" button', async () => {
            await screen.findByText(`Create New Space`);
        });
    });

    const createTestComponent = async (hasSpaces = true): Promise<{ cookies: Cookies; }> => {
        const fakeAccessToken = 'FAKE_TOKEN123';
        const cookies = new Cookies();
        cookies.set('accessToken', fakeAccessToken);
        const responseData = hasSpaces ? [{
            name: 'Space1',
            uuid: 'SpaceUUID',
            lastModifiedDate: '2020-04-14T18:06:11.791+0000',
        }] : [];
        SpaceClient.getSpacesForUser = jest.fn().mockResolvedValue(responseData);
        SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue([]);

        await act(async () => {
            renderWithRecoil(
                <MemoryRouter initialEntries={['/user/dashboard']}>
                    <SpaceDashboard/>
                </MemoryRouter>
            );
        })

        return {cookies};
    };
});
