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
import TimeOnProduct, {generateTimeOnProductItems} from './TimeOnProduct';
import {MemoryRouter} from 'react-router-dom';
import {GlobalStateProps} from '../Redux/Reducers';
import {Product, UNASSIGNED} from '../Products/Product';

describe('TimeOnProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('calculation', () => {
        it('should show 1 day spend on the project when viewingDate equal start date', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 0, 1),
                products: [TestUtils.productForHank],
            } as GlobalStateProps;

            let app = renderWithRedux(<TimeOnProduct/>, undefined, initialState);

            const list = await app.getByTestId(TestUtils.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('1 day');

        });

        it('should show the number of days on the project since selected viewingDate', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 0, 10),
                products: [TestUtils.productForHank],
            } as GlobalStateProps;

            let app = renderWithRedux(<TimeOnProduct/>, undefined, initialState);

            const list = await app.getByTestId(TestUtils.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('10 days');

        });
    });

    describe(' redirect', () => {
        let originalWindow: Window;
        beforeEach(() => {
            originalWindow = window;
            delete window.location;
            (window as Window) = Object.create(window);
        });

        afterEach(() => {
            (window as Window) = originalWindow;
        });

        it('should redirect to the space page when there is no state', async () => {
            window.location = {origin: 'https://localhost', pathname: '/uuid/timeonproduct'} as Location;
            await renderWithRedux(
                <MemoryRouter>
                    <TimeOnProduct/>
                </MemoryRouter>);

            expect(window.location.href).toBe('https://localhost/uuid');
        });
    });

    describe('generateTimeOnProductItems', () => {
        it('should return an array of TimeOnProductItem objects', () => {
            let unassignedProduct: Product = {
                id: 999,
                name: UNASSIGNED,
                spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                assignments: [TestUtils.assignmentForUnassigned, TestUtils.assignmentForUnassignedNoRole],
                startDate: '',
                endDate: '',
                archived: false,
                tags: [],
            };
            const products = [TestUtils.productForHank, unassignedProduct];
            const viewingDate = new Date(2020, 0, 10);
            const timeOnProductItems = generateTimeOnProductItems(products, viewingDate);

            const expectedProduct1 = {personName: 'Hank', productName: 'Hanky Product', personRole: 'Product Manager', timeOnProduct: 10};
            const expectedProduct2 = {personName: 'Unassigned Person 7', productName: 'Unassigned', personRole: 'Software Engineer', timeOnProduct: 9};
            const expectedProduct3 = {personName: 'Unassigned Person No Role', productName: 'Unassigned', personRole: 'No Role Assigned', timeOnProduct: 9};

            expect(timeOnProductItems.length).toEqual(3);
            expect(timeOnProductItems).toContainEqual(expectedProduct1);
            expect(timeOnProductItems).toContainEqual(expectedProduct2);
            expect(timeOnProductItems).toContainEqual(expectedProduct3);
        });
    });
});
