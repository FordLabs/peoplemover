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
import TimeOnProduct, {generateTimeOnProductItems, sortTimeOnProductItems, TimeOnProductItem} from './TimeOnProduct';
import {MemoryRouter} from 'react-router-dom';
import rootReducer from '../Redux/Reducers';
import {Product, UNASSIGNED} from '../Products/Product';
import {cleanup, RenderResult} from '@testing-library/react';
import {fireEvent} from '@testing-library/dom';
import {createStore, Store} from 'redux';
import {setCurrentModalAction} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';

describe('TimeOnProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('calculation', () => {
        let store: Store;
        let app: RenderResult;

        beforeEach(() => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 0, 1),
                products: [TestUtils.productForHank],
            };
            store = createStore(rootReducer, initialState);
            store.dispatch = jest.fn();
            app = renderWithRedux(<TimeOnProduct/>, store);
        });

        it('should show 1 day spend on the project when viewingDate equal start date', async () => {
            const list = await app.getByTestId(TestUtils.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('1 day');
        });

        it('should show the number of days on the project since selected viewingDate', async () => {
            cleanup();
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 0, 10),
                products: [TestUtils.productForHank],
            };
            store = createStore(rootReducer, initialState);
            store.dispatch = jest.fn();
            app = renderWithRedux(<TimeOnProduct/>, store);

            const list = await app.getByTestId(TestUtils.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('10 days');
        });

        it('should make the call to open the Edit Person modal when person name is clicked', async () => {
            const hank = app.getByText('Hank');
            fireEvent.click(hank);
            expect(store.dispatch).toHaveBeenCalledWith(
                setCurrentModalAction({
                    modal: AvailableModals.EDIT_PERSON,
                    item: TestUtils.hank,
                })
            );
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

            const expectedProduct1 = {personName: 'Hank', productName: 'Hanky Product', personRole: 'Product Manager', timeOnProduct: 10, assignmentId: 3, personId: 200};
            const expectedProduct2 = {personName: 'Unassigned Person 7', productName: 'Unassigned', personRole: 'Software Engineer', timeOnProduct: 9, assignmentId: 11, personId: 101};
            const expectedProduct3 = {personName: 'Unassigned Person No Role', productName: 'Unassigned', personRole: 'No Role Assigned', timeOnProduct: 9, assignmentId: 14, personId: 106};

            expect(timeOnProductItems.length).toEqual(3);
            expect(timeOnProductItems).toContainEqual(expectedProduct1);
            expect(timeOnProductItems).toContainEqual(expectedProduct2);
            expect(timeOnProductItems).toContainEqual(expectedProduct3);
        });
    });

    describe('TimeOnProductItems sort', () => {
        it('should first sort by product name, role, time on product and person name, in that order', () => {
            const timeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 0,  productName: 'product1', personRole: 'role1', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 1,  productName: 'product2', personRole: 'role1', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 2,  productName: 'product3', personRole: 'role2', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 3,  productName: 'product4', personRole: 'role2', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 4,  productName: 'product1', personRole: 'role3', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 5,  productName: 'product2', personRole: 'role3', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 6,  productName: 'product3', personRole: 'role4', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 7,  productName: 'product4', personRole: 'role4', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 8,  productName: 'product1', personRole: 'role1', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 9,  productName: 'product2', personRole: 'role1', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 10, productName: 'product3', personRole: 'role2', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 11, productName: 'product4', personRole: 'role2', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 12, productName: 'product1', personRole: 'role3', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 13, productName: 'product2', personRole: 'role3', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 14, productName: 'product3', personRole: 'role4', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 15, productName: 'product4', personRole: 'role4', timeOnProduct: 40, personName: 'person1', personId: 1},
            ];
            const expectedTimeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 8,  productName: 'product1', personRole: 'role1', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 0,  productName: 'product1', personRole: 'role1', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 12, productName: 'product1', personRole: 'role3', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 4,  productName: 'product1', personRole: 'role3', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 9,  productName: 'product2', personRole: 'role1', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 1,  productName: 'product2', personRole: 'role1', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 13, productName: 'product2', personRole: 'role3', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 5,  productName: 'product2', personRole: 'role3', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 10, productName: 'product3', personRole: 'role2', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 2,  productName: 'product3', personRole: 'role2', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 14, productName: 'product3', personRole: 'role4', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 6,  productName: 'product3', personRole: 'role4', timeOnProduct: 20, personName: 'person2', personId: 2},
                {assignmentId: 11, productName: 'product4', personRole: 'role2', timeOnProduct: 30, personName: 'person1', personId: 1},
                {assignmentId: 3,  productName: 'product4', personRole: 'role2', timeOnProduct: 10, personName: 'person2', personId: 2},
                {assignmentId: 15, productName: 'product4', personRole: 'role4', timeOnProduct: 40, personName: 'person1', personId: 1},
                {assignmentId: 7,  productName: 'product4', personRole: 'role4', timeOnProduct: 20, personName: 'person2', personId: 2},
            ];
            const actualTimeOnProductItems = timeOnProductItems.sort(sortTimeOnProductItems);
            for (let i = 0; i < actualTimeOnProductItems.length; i++) {
                expect(actualTimeOnProductItems[i].assignmentId).toEqual(expectedTimeOnProductItems[i].assignmentId);
            }
        });
    });
});
