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
import {screen} from '@testing-library/react';
import {renderWithRecoil} from '../Utils/TestUtils';
import SubHeader from './SubHeader';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

jest.mock('./Calendar/Calendar', () => {
    return jest.fn(() => <div>Calendar</div>);
});

jest.mock('./SortingAndFiltering/Filter', () => {
    return jest.fn(() => <div>Filter</div>);
});

jest.mock('./ProductSortBySelector/ProductSortBySelector', () => {
    return jest.fn(() => <div>ProductSortBySelector</div>);
});

describe('SubHeader', () => {
    it('should show "View Only" when in read only mode', () => {
        renderWithRecoil(<SubHeader />, ({set}) => {
            set(IsReadOnlyState, true)
        });
        expect(screen.getByText('View only')).toBeDefined();
    });

    it('should NOT show "View Only" when in default mode', () => {
        renderWithRecoil(<SubHeader />);
        expect(screen.queryByText('View only')).toBeNull();
    });

    it('should render calendar', () => {
        renderWithRecoil(<SubHeader />);
        expect(screen.getByText('Calendar')).toBeDefined();
    });

    it('should render message if passed in', () => {
        const expectedMessage = 'Have a great day!'
        renderWithRecoil(<SubHeader message={<>{expectedMessage}</>} />);
        expect(screen.getByText(expectedMessage)).toBeDefined();
    });

    it('should show filters by default', () => {
        renderWithRecoil(<SubHeader />);
        expect(screen.getAllByText('Filter')).toHaveLength(4);
    });

    it('should hide filters when showFilters prop is false', () => {
        renderWithRecoil(<SubHeader showFilters={false} />);
        expect(screen.queryByText('Filter')).toBeNull();
    });

    it('should show selector for sorting products by default', () => {
        renderWithRecoil(<SubHeader />);
        expect(screen.getByText('ProductSortBySelector')).toBeDefined();
    });

    it('should hide selector for sorting products when showSortBy prop is false', () => {
        renderWithRecoil(<SubHeader showSortBy={false} />);
        expect(screen.queryByText('ProductSortBySelector')).toBeNull();
    });
});