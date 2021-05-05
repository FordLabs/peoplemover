/*
 * Copyright (c) 2021 Ford Motor Company
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
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import Counter from './Counter';
import {RenderResult} from '@testing-library/react';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';

describe('counter', () => {
    let app: RenderResult;
    let viewingDate = new Date(2021, 4, 13);

    let noFilter: Array<AllGroupedTagFilterOptions>  = [
        {
            label:'Location Tags:',
            options: [],
        },
        {
            label:'Product Tags:',
            options: [],
        },
        {
            label:'Role Tags:',
            options: [{
                label: 'Product Manager',
                value:'2_Product Manager',
                selected:  false,
            }],
        },
    ];


    it('should display the number of products and people when no filter are applied and ignore archived products', async () => {
        let expectedString = 'Results - Products: 4, People: 3 (Unassigned: 1)';
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={noFilter} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should not count product that are ended before today', async () => {
        let expectedString = 'Results - Products: 0, People: 1 (Unassigned: 1)';
        let finishedProduct = {
            id: 5,
            name: 'Awesome Product',
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '2011-01-01',
            endDate: '2020-02-02',
            assignments: [],
            archived: false,
            tags: [],
        };

        app = renderWithRedux(<Counter products={[finishedProduct, TestUtils.unassignedProduct]} allGroupedTagFilterOptions={noFilter} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when role filters are applied', async () => {
        let expectedString = 'Results - Products: 4, People: 2 (Unassigned: 1)';
        let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
            {
                label:'Location Tags:',
                options: [],
            },
            {
                label:'Product Tags:',
                options: [],
            },
            {
                label:'Role Tags:',
                options: [{
                    label: 'Software Engineer',
                    value: '1_Software Engineer',
                    selected: true,
                },
                {
                    label: 'Product Manager',
                    value:'2_Product Manager',
                    selected:  false,
                }],
            },
        ];

        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when location filters are applied', async () => {
        let expectedString = 'Results - Products: 1, People: 2 (Unassigned: 1)';
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={TestUtils.allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when product filters are applied', async () => {
        let expectedString = 'Results - Products: 1, People: 2 (Unassigned: 1)';
        let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
            {
                label:'Location Tags:',
                options: [{
                    label: 'Southfield',
                    value: '4_Southfield',
                    selected: true,
                },
                {
                    label: 'Ann Arbor',
                    value: '1_AnnArbor',
                    selected: false,
                }],
            },
            {
                label:'Product Tags:',
                options: [{
                    label:'FordX',
                    value:'5_FordX',
                    selected: true,
                }],
            },
            {
                label:'Role Tags:',
                options: [{
                    label: 'Software Engineer',
                    value: '1_Software Engineer',
                    selected: true,
                },
                {
                    label: 'Product Manager',
                    value:'2_Product Manager',
                    selected:  false,
                }],
            },
        ];
        
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });
});
