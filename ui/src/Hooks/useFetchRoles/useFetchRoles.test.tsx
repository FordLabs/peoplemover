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
import useFetchRoles from './useFetchRoles';
import RoleClient from 'Services/Api/RoleClient';
import TestData from 'Utils/TestData';
import TestUtils from '../../Utils/TestUtils';

const wrapper = TestUtils.hookWrapper;

jest.mock('Services/Api/RoleClient');

const spaceUUID = 'space-uuid';

const rolesNotAlphabetical = [
    TestData.productManager,
    TestData.softwareEngineer,
    TestData.productDesigner,
]
const rolesAlphabetical = TestData.roles;

describe('useFetchRoles Hook', () => {
    it('should fetch all roles for space and store them in recoil alphabetically', async () => {
        RoleClient.get = jest.fn().mockResolvedValue({ data: rolesNotAlphabetical })

        const { result } = renderHook(() => useFetchRoles(spaceUUID), { wrapper });

        expect(RoleClient.get).not.toHaveBeenCalled()
        expect(result.current.roles).toEqual([]);

        await act(async () => {
            result.current.fetchRoles()
        });
        expect(RoleClient.get).toHaveBeenCalledWith(spaceUUID);
        expect(result.current.roles).toEqual(rolesAlphabetical);
    });
});