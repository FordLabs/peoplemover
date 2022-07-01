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

import React, {ReactNode} from 'react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {act, renderHook} from '@testing-library/react-hooks';
import {RecoilRoot} from 'recoil';
import TestData from '../Utils/TestData';
import LocationClient from '../Locations/LocationClient';
import useFetchLocations from './useFetchLocations';

jest.mock('../Locations/LocationClient');

const teamUUID = 'team-uuid';

const locationsNotAlphabetical = [
    TestData.southfield,
    TestData.dearborn,
    TestData.annarbor,
    TestData.detroit,
]
const locationsAlphabetical = TestData.locations;

describe('useFetchLocations Hook', () => {
    it('should fetch all location tags and store them in recoil alphabetically', async () => {
        LocationClient.get = jest.fn().mockResolvedValue({ data: locationsNotAlphabetical })

        const { result } = renderHook(() => useFetchLocations(), { wrapper });

        expect(LocationClient.get).not.toHaveBeenCalled()
        expect(result.current.locations).toEqual([]);

        await act(async () => {
            result.current.fetchLocations()
        });
        expect(LocationClient.get).toHaveBeenCalledWith(teamUUID);
        expect(result.current.locations).toEqual(locationsAlphabetical);
    });
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/${teamUUID}`]}>
        <RecoilRoot>
            <Routes>
                <Route path="/:teamUUID" element={children} />
            </Routes>
        </RecoilRoot>
    </MemoryRouter>
);