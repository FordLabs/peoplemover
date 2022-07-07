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
import ProductTagClient from '../../Tags/ProductTag/ProductTagClient';
import useFetchProductTags from './useFetchProductTags';

jest.mock('Tags/ProductTag/ProductTagClient');

const spaceUUID = 'space-uuid';

const productTagsNotAlphabetical = TestData.productTags;

const productTagsAlphabetical = [
    TestData.productTag1,
    TestData.productTag3,
    TestData.productTag2,
    TestData.productTag4,
];

describe('useFetchProductTags Hook', () => {
    it('should fetch all product tags for space and store them in recoil alphabetically', async () => {
        ProductTagClient.get = jest.fn().mockResolvedValue({ data: productTagsNotAlphabetical })

        const { result } = renderHook(() => useFetchProductTags(spaceUUID), { wrapper });

        expect(ProductTagClient.get).not.toHaveBeenCalled()
        expect(result.current.productTags).toEqual([]);

        await act(async () => {
            result.current.fetchProductTags()
        });
        expect(ProductTagClient.get).toHaveBeenCalledWith(spaceUUID);
        expect(result.current.productTags).toEqual(productTagsAlphabetical);
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