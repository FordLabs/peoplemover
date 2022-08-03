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

import React from 'react';
import {act, renderHook} from '@testing-library/react-hooks';
import TestData from 'Utils/TestData';
import PersonTagClient from '../../Services/Api/PersonTagClient';
import useFetchPersonTags from './useFetchPersonTags';
import TestUtils from '../../Utils/TestUtils';

const wrapper = TestUtils.hookWrapper;

jest.mock('Services/Api/PersonTagClient');

const spaceUUID = 'space-uuid';

const personTagsNotAlphabetical = TestData.personTags;

const personTagsAlphabetical = [
    TestData.personTag2,
    TestData.personTag1
];

describe('useFetchPersonTags Hook', () => {
    it('should fetch all person tags for space and store them in recoil alphabetically', async () => {
        PersonTagClient.get = jest.fn().mockResolvedValue({ data: personTagsNotAlphabetical })

        const { result } = renderHook(() => useFetchPersonTags(spaceUUID), { wrapper });

        expect(PersonTagClient.get).not.toHaveBeenCalled()
        expect(result.current.personTags).toEqual([]);

        await act(async () => {
            result.current.fetchPersonTags()
        });
        expect(PersonTagClient.get).toHaveBeenCalledWith(spaceUUID);
        expect(result.current.personTags).toEqual(personTagsAlphabetical);
    });
});