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

import { act, renderHook } from '@testing-library/react-hooks';
import TestData from 'Utils/TestData';
import LocationClient from 'Services/Api/LocationClient';
import useFetchLocations from './useFetchLocations';
import TestUtils from '../../Utils/TestUtils';

const wrapper = TestUtils.hookWrapper;

jest.mock('Services/Api/LocationClient');

const spaceUUID = 'space-uuid';

const locationsNotAlphabetical = [
    TestData.southfield,
    TestData.dearborn,
    TestData.annarbor,
    TestData.detroit,
];
const locationsAlphabetical = TestData.locations;

describe('useFetchLocations Hook', () => {
    it('should fetch all location tags and store them in recoil alphabetically', async () => {
        LocationClient.get = jest
            .fn()
            .mockResolvedValue({ data: locationsNotAlphabetical });

        const { result } = renderHook(() => useFetchLocations(spaceUUID), {
            wrapper,
        });

        expect(LocationClient.get).not.toHaveBeenCalled();
        expect(result.current.locations).toEqual([]);

        await act(async () => {
            result.current.fetchLocations();
        });
        expect(LocationClient.get).toHaveBeenCalledWith(spaceUUID);
        expect(result.current.locations).toEqual(locationsAlphabetical);
    });
});
