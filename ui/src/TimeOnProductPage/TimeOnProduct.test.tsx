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
import TimeOnProduct, {
    generateTimeOnProductItems,
    LOADING,
    sortTimeOnProductItems,
    TimeOnProductItem,
} from './TimeOnProduct';
import {MemoryRouter} from 'react-router-dom';
import rootReducer from '../Redux/Reducers';
import {Product, UNASSIGNED} from '../Products/Product';
import {cleanup, RenderResult} from '@testing-library/react';
import {fireEvent} from '@testing-library/dom';
import {applyMiddleware, createStore, Store} from 'redux';
import {
    setCurrentModalAction,
    setViewingDateAction,
} from '../Redux/Actions';
import {AvailableModals} from '../Modal/AvailableModals';
import { act } from 'react-dom/test-utils';
import thunk from 'redux-thunk';

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
                isReadOnly: false,
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
            const hank = app.getByText(TestUtils.hank.name);
            expect(hank).toBeEnabled();
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
        let location: (string | Location) & Location;

        beforeEach(() => {
            location = window.location;
            Reflect.deleteProperty(window, 'location');
        });

        afterEach(() => {
            window.location = location;
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

    describe('sort', () => {
        it('should first sort by person nme', () => {
            const timeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 0,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person2', personId: 2},
                {assignmentId: 1,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person1', personId: 1},
                {assignmentId: 2,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person1', personId: 1},
            ];
            const expectedTimeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 1,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person1', personId: 1},
                {assignmentId: 2,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person1', personId: 1},
                {assignmentId: 0,  productName: '', personRole: '', timeOnProduct: 0, personName: 'person2', personId: 2},
            ];
            const actualTimeOnProductItems = [...timeOnProductItems].sort(sortTimeOnProductItems);
            for (let i = 0; i < actualTimeOnProductItems.length; i++) {
                expect(actualTimeOnProductItems[i].assignmentId).toEqual(expectedTimeOnProductItems[i].assignmentId);
                expect(actualTimeOnProductItems[i].personName).toEqual(expectedTimeOnProductItems[i].personName);
            }
        });

        it('should first sort by person name, then by product name', () => {
            const timeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 0,  productName: 'product2', personRole: '', timeOnProduct: 0, personName: '', personId: 2},
                {assignmentId: 1,  productName: 'product1', personRole: '', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 2,  productName: 'product1', personRole: '', timeOnProduct: 0, personName: '', personId: 1},
            ];
            const expectedTimeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 1,  productName: 'product1', personRole: '', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 2,  productName: 'product1', personRole: '', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 0,  productName: 'product2', personRole: '', timeOnProduct: 0, personName: '', personId: 2},
            ];
            const actualTimeOnProductItems = [...timeOnProductItems].sort(sortTimeOnProductItems);
            for (let i = 0; i < actualTimeOnProductItems.length; i++) {
                expect(actualTimeOnProductItems[i].assignmentId).toEqual(expectedTimeOnProductItems[i].assignmentId);
                expect(actualTimeOnProductItems[i].productName).toEqual(expectedTimeOnProductItems[i].productName);
            }
        });

        it('should first sort by person name, then by product name, then by role', () => {
            const timeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 0,  productName: '', personRole: 'role2', timeOnProduct: 0, personName: '', personId: 2},
                {assignmentId: 1,  productName: '', personRole: 'role1', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 2,  productName: '', personRole: 'role1', timeOnProduct: 0, personName: '', personId: 1},
            ];
            const expectedTimeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 1,  productName: '', personRole: 'role1', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 2,  productName: '', personRole: 'role1', timeOnProduct: 0, personName: '', personId: 1},
                {assignmentId: 0,  productName: '', personRole: 'role2', timeOnProduct: 0, personName: '', personId: 2},
            ];
            const actualTimeOnProductItems = [...timeOnProductItems].sort(sortTimeOnProductItems);
            for (let i = 0; i < actualTimeOnProductItems.length; i++) {
                expect(actualTimeOnProductItems[i].assignmentId).toEqual(expectedTimeOnProductItems[i].assignmentId);
                expect(actualTimeOnProductItems[i].productName).toEqual(expectedTimeOnProductItems[i].productName);
            }
        });

        it('should first sort by person name, then by product name, then by role, then by time on product (descending)', () => {
            const timeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 0,  productName: '', personRole: '', timeOnProduct: 1, personName: '', personId: 1},
                {assignmentId: 1,  productName: '', personRole: '', timeOnProduct: 1, personName: '', personId: 1},
                {assignmentId: 2,  productName: '', personRole: '', timeOnProduct: 2, personName: '', personId: 2},
            ];
            const expectedTimeOnProductItems: TimeOnProductItem[] = [
                {assignmentId: 2,  productName: '', personRole: '', timeOnProduct: 2, personName: '', personId: 2},
                {assignmentId: 0,  productName: '', personRole: '', timeOnProduct: 1, personName: '', personId: 1},
                {assignmentId: 1,  productName: '', personRole: '', timeOnProduct: 1, personName: '', personId: 1},
            ];
            const actualTimeOnProductItems = [...timeOnProductItems].sort(sortTimeOnProductItems);
            for (let i = 0; i < actualTimeOnProductItems.length; i++) {
                expect(actualTimeOnProductItems[i].assignmentId).toEqual(expectedTimeOnProductItems[i].assignmentId);
                expect(actualTimeOnProductItems[i].productName).toEqual(expectedTimeOnProductItems[i].productName);
            }
        });
    });

    describe('Loading', () => {
        it('should show loading', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
            };
            let store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = renderWithRedux(<TimeOnProduct/>, store);
            act(() => {
                store.dispatch(setViewingDateAction(new Date(2020, 0, 1)));
            });
            await app.findByText(LOADING);
        });
    });

    describe('View Only', () => {
        it('person name button should be disabled', () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 0, 1),
                products: [TestUtils.productForHank],
                isReadOnly: true,
            };
            let store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = renderWithRedux(<TimeOnProduct/>, store);
            const hank = app.getByText(TestUtils.hank.name);
            expect(hank).toBeDisabled();
        });
    });
});
