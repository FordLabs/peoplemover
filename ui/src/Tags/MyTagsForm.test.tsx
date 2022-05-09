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

import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {screen} from '@testing-library/react';
import MyTagsForm from './MyTagsForm';
import {FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import React from 'react';
import moment from 'moment';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';

describe('My Tags Form', () => {
    const initialState: PreloadedState<Partial<GlobalStateProps>> = {
        productTags: TestUtils.productTags,
        locations: TestUtils.locations,
        allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        viewingDate: moment().toDate(),
        productSortBy: 'name',
        currentSpace: TestUtils.space,
    };

    it('should only display location tags when the passed-in filter type is location tags', async () => {
        renderWithRedux(<MyTagsForm filterType={FilterTypeListings.Location}/>, undefined, initialState);

        // location included in TestUtils.locations
        await screen.findByText( TestUtils.annarbor.name);
        await screen.findByText( TestUtils.detroit.name);
        await screen.findByText( TestUtils.dearborn.name);
        await screen.findByText( TestUtils.southfield.name);
    });

    it('should only display product tags when the passed-in filter type is product tags', async () => {
        renderWithRedux(<MyTagsForm filterType={FilterTypeListings.ProductTag}/>, undefined, initialState);

        // product tags included in TestUtils.productTags
        await screen.findByText(TestUtils.productTag1.name);
        await screen.findByText(TestUtils.productTag2.name);
        await screen.findByText(TestUtils.productTag3.name);
        await screen.findByText(TestUtils.productTag4.name);
    });
});
