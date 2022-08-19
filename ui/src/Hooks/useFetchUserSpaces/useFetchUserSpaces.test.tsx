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
import SpaceClient from 'Services/Api/SpaceClient';
import useFetchUserSpaces from './useFetchUserSpaces';
import TestUtils from '../../Utils/TestUtils';

const wrapper = TestUtils.hookWrapper;

jest.mock('Services/Api/SpaceClient');

describe('useFetchUserSpaces Hook', () => {
    it('should fetch all spaces and store them in recoil', async () => {
        const { result } = renderHook(() => useFetchUserSpaces(), { wrapper });

        expect(SpaceClient.getSpacesForUser).not.toHaveBeenCalled();
        expect(result.current.userSpaces).toEqual([]);

        await act(async () => {
            await result.current.fetchUserSpaces();
        });
        expect(SpaceClient.getSpacesForUser).toHaveBeenCalledWith();
        expect(result.current.userSpaces).toEqual([TestData.space]);
    });
});
