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
import TestData from 'Utils/TestData';
import SpaceClient from '../../Space/SpaceClient';
import useFetchCurrentSpace from './useFetchCurrentSpace';

jest.mock('Locations/LocationClient');

const spaceUUID = 'space-uuid';

describe('useFetchCurrentSpace Hook', () => {
    it('should fetch the current space and store them in recoil', async () => {
        SpaceClient.getSpaceFromUuid = jest.fn().mockResolvedValue({ data: TestData.space })

        const { result } = renderHook(() => useFetchCurrentSpace(spaceUUID), { wrapper });

        expect(SpaceClient.getSpaceFromUuid).not.toHaveBeenCalled()
        expect(result.current.currentSpace).toEqual({"lastModifiedDate": "", "name": "", "todayViewIsPublic": false});

        await act(async () => {
            result.current.fetchCurrentSpace()
        });
        expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalledWith(spaceUUID);
        expect(result.current.currentSpace).toEqual(TestData.space);
    });
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[`/${spaceUUID}`]}>
        <RecoilRoot>
            <Routes>
                <Route path="/:teamUUID" element={children} />
            </Routes>
        </RecoilRoot>
    </MemoryRouter>
);