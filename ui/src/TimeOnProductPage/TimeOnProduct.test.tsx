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
import TimeOnProduct from './TimeOnProduct';
import {MemoryRouter} from 'react-router-dom';
import {GlobalStateProps} from '../Redux/Reducers';
import {Product} from '../Products/Product';

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

        it('should show no assignments for a product that didnt have assignment at this date', async () => {

            let productForHankAs20190110: Product = {
                id: 102,
                name: 'Hanky Product',
                spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                startDate: '2011-01-01',
                endDate: '2022-02-02',
                spaceLocation: TestUtils.annarbor,
                assignments: [],
                archived: false,
                tags: [],
            };

            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2019, 0, 10),
                products: [productForHankAs20190110],
            } as GlobalStateProps;

            let app = renderWithRedux(<TimeOnProduct/>, undefined, initialState);

            const product = await app.getByTestId(productForHankAs20190110.id.toString());
            expect(product).toBeVisible();

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

});
