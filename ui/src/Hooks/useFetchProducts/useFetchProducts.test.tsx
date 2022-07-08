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
import {MemoryRouter} from 'react-router-dom';
import {act, renderHook} from '@testing-library/react-hooks';
import {RecoilRoot} from 'recoil';
import useFetchProducts from './useFetchProducts';
import ProductClient from 'Products/ProductClient';
import {ViewingDateState} from 'State/ViewingDateState';
import TestData from 'Utils/TestData';

jest.mock('Products/ProductClient');

const spaceUUID = 'space-uuid';
const viewingDate = new Date();

describe('useFetchProducts Hook', () => {
    it('should fetch all products and store them in recoil', async () => {
        const { result } = renderHook(() => useFetchProducts(spaceUUID), { wrapper });

        expect(ProductClient.getProductsForDate).not.toHaveBeenCalled()
        expect(result.current.products).toEqual([]);

        await act(async () => {
            result.current.fetchProducts()
        });
        expect(ProductClient.getProductsForDate).toHaveBeenCalledWith(spaceUUID, viewingDate);
        expect(result.current.products).toEqual(TestData.products);
    });
});

const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <RecoilRoot initializeState={({set}) => {
            set(ViewingDateState, viewingDate)
        }}>
            {children}
        </RecoilRoot>
    </MemoryRouter>
);