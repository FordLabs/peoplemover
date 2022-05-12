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
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import Counter from './Counter';
import {RenderResult} from '@testing-library/react';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {Product} from '../Products/Product';

describe('counter', () => {
    let app: RenderResult;
    const viewingDate = new Date(2021, 4, 13);

    const noFilter: Array<AllGroupedTagFilterOptions>  = [
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
        {
            label:'Person Tags:',
            options: [],
        },
    ];


    it('should display the number of products and people when no filter are applied and ignore archived products', async () => {
        const expectedString = 'Results - Products: 4, People: 3 (Unassigned: 1)';
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={noFilter} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should not count product that are ended before today', async () => {
        const expectedString = 'Results - Products: 0, People: 1 (Unassigned: 1)';
        const finishedProduct = {
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
        const expectedString = 'Results - Products: 4, People: 2 (Unassigned: 1)';
        const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
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
            {
                label: 'Person Tags:',
                options: [],
            },
        ];

        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when location filters are applied', async () => {
        const expectedString = 'Results - Products: 1, People: 2 (Unassigned: 1)';
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={TestUtils.allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when all filters are applied', async () => {
        const expectedString = 'Results - Products: 1, People: 1 (Unassigned: 0)';
        const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
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
            {
                label:'Person Tags:',
                options: [
                    {label: 'The lil boss', value: '5_The_lil_boss', selected: true},
                ],
            },
        ];
        
        app = renderWithRedux(<Counter products={TestUtils.products} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when one person tag filter is applied', async () => {
        const expectedString = 'Results - Products: 1, People: 1 (Unassigned: 0)';
        const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
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
                options: [],
            },
            {
                label: 'Person Tags:',
                options: [
                    {label: 'The lil boss', value: '5_The_lil_boss', selected: false},
                    {label: 'The big boss', value: '6_The_big_boss', selected: true},
                ],
            },
        ];

        app = renderWithRedux(<Counter products={[TestUtils.unassignedProductForBigBossSE, TestUtils.productWithTags]} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });

    it('should display the number of products and people when people are in multiple products', async () => {
        const expectedString = 'Results - Products: 2, People: 3 (Unassigned: 0)';
        const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>  = [
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
                options: [],
            },
            {
                label: 'Person Tags:',
                options: [
                    {label: 'The lil boss', value: '5_The_lil_boss', selected: true},
                    {label: 'The big boss', value: '6_The_big_boss', selected: true},
                ],
            },
        ];

        const productWithPersonAlreadyAssignedInProduct1: Product = {
            id: 2,
            name: 'Product 2',
            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            startDate: '2011-01-01',
            endDate: '2022-02-02',
            spaceLocation: TestUtils.southfield,
            assignments: TestUtils.assignmentsFilterTest,
            archived: false,
            tags: [TestUtils.productTag2],
            notes: 'note',
        };

        app = renderWithRedux(<Counter products={[TestUtils.unassignedProductForBigBossSE, TestUtils.productWithTags, productWithPersonAlreadyAssignedInProduct1]} allGroupedTagFilterOptions={allGroupedTagFilterOptions} viewingDate={viewingDate}/>);
        const counter = await app.findByTestId('counter');
        expect(counter).toContainHTML(expectedString);
    });
});
