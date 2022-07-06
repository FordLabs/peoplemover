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

import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {screen} from '@testing-library/react';
import MyTagsForm from './MyTagsForm';
import {FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import React from 'react';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {RecoilRoot} from 'recoil';
import {LocationsState} from '../State/LocationsState';
import {ProductTagsState} from '../State/ProductTagsState';

describe('My Tags Form', () => {
    const initialState: PreloadedState<Partial<GlobalStateProps>> = {
        allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
        currentSpace: TestData.space,
    };

    it('should only display location tags when the passed-in filter type is location tags', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(LocationsState, TestData.locations)
                set(ProductTagsState, TestData.productTags)
            }}>
                <MyTagsForm filterType={FilterTypeListings.Location}/>
            </RecoilRoot>,
            undefined,
            initialState
        );

        await screen.findByText( TestData.annarbor.name);
        await screen.findByText( TestData.detroit.name);
        await screen.findByText( TestData.dearborn.name);
        await screen.findByText( TestData.southfield.name);
    });

    it('should only display product tags when the passed-in filter type is product tags', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(LocationsState, TestData.locations)
                set(ProductTagsState, TestData.productTags)
            }}>
                <MyTagsForm filterType={FilterTypeListings.ProductTag}/>
            </RecoilRoot>,
            undefined,
            initialState
        );

        await screen.findByText(TestData.productTag1.name);
        await screen.findByText(TestData.productTag2.name);
        await screen.findByText(TestData.productTag3.name);
        await screen.findByText(TestData.productTag4.name);
    });
});
