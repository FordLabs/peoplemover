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
import TestData from '../Utils/TestData';
import TimeOnProduct, {
    generateTimeOnProductItems,
    LOADING,
    sortTimeOnProductItems,
    TimeOnProductItem,
} from './TimeOnProduct';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {Product, UNASSIGNED} from '../Products/Product';
import {cleanup, screen, waitFor} from '@testing-library/react';
import {fireEvent} from '@testing-library/dom';
import {applyMiddleware, createStore, PreloadedState, Store} from 'redux';
import thunk from 'redux-thunk';
import {MutableSnapshot, RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ProductsState} from '../State/ProductsState';
import ProductClient from '../Products/ProductClient';
import {RecoilObserver} from 'Utils/RecoilObserver';
import {ModalContents, ModalContentsState} from 'State/ModalContentsState';
import PersonForm from '../People/PersonForm';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import SpaceClient from '../Space/SpaceClient';
import {Space} from '../Space/Space';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));
jest.mock('Products/ProductClient');
jest.mock('Space/SpaceClient');
jest.mock('Tags/ProductTag/ProductTagClient');
jest.mock('Tags/PersonTag/PersonTagClient');

describe('TimeOnProduct', () => {
    let store: Store;
    let modalContent: ModalContents | null = null;

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('calculation', () => {
        beforeEach(async () => {
            await renderTimeOnProduct({}, ({set}) => {
                set(ViewingDateState, new Date(2020, 0, 1))
                set(IsReadOnlyState, false)
                set(ProductsState, [TestData.productForHank])
            })
        });

        it('should show 1 day spend on the project when viewingDate equal start date', async () => {
            const list = await screen.getByTestId(TestData.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('1 day');
        });

        it('should show the number of days on the project since selected viewingDate', async () => {
            cleanup();
            store = createStore(rootReducer);
            store.dispatch = jest.fn();
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 0, 10))
                    set(ProductsState, [TestData.productForHank])
                    set(CurrentSpaceState,TestData.space)
                }}>
                    <MemoryRouter initialEntries={['/team-uuid']}>
                        <Routes>
                            <Route path="/:teamUUID" element={<TimeOnProduct/>} />
                        </Routes>
                    </MemoryRouter>
                </RecoilRoot>,
                store
            );
            await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalled())

            const list = await screen.getByTestId(TestData.productForHank.assignments[0].id.toString());
            expect(list).toContainHTML('Hank');
            expect(list).toContainHTML('10 days');
        });

        it('should make the call to open the Edit Person modal when person name is clicked', async () => {
            const hank = screen.getByText(TestData.hank.name);
            expect(hank).toBeEnabled();
            expect(modalContent).toBeNull();
            fireEvent.click(hank);
            await waitFor(() => expect(modalContent).toEqual({
                title: 'Edit Person',
                component: <PersonForm
                    isEditPersonForm
                    personEdited={TestData.hank}
                />,
            }));
        });
    });

    it('should fetch current space if not already gotten', async () => {
        let actualCurrentSpace: Space | null = null;
        renderWithRedux(
            <RecoilRoot>
                <MemoryRouter initialEntries={[`/${TestData.space.uuid}/timeonproduct`]}>
                    <Routes>
                        <Route path="/:teamUUID/timeonproduct" element={
                            <>
                                <RecoilObserver
                                    recoilState={CurrentSpaceState}
                                    onChange={(value: Space) => {
                                        actualCurrentSpace = value;
                                    }}
                                />
                                <TimeOnProduct/>
                            </>
                        } />
                    </Routes>
                </MemoryRouter>
            </RecoilRoot>
        );
        await waitFor(() => expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalled())
        expect(actualCurrentSpace).toEqual(TestData.space);
    });

    describe('generateTimeOnProductItems', () => {
        it('should return an array of TimeOnProductItem objects', () => {
            const unassignedProduct: Product = {
                id: 999,
                name: UNASSIGNED,
                spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                assignments: [TestData.assignmentForUnassigned, TestData.assignmentForUnassignedNoRole],
                startDate: '',
                endDate: '',
                archived: false,
                tags: [],
            };
            const products = [TestData.productForHank, unassignedProduct];
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
        it('should show loading state', async () => {
            const store = createStore(rootReducer, {}, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <TimeOnProduct/>
                </RecoilRoot>,
                store
            );
            await screen.findByText(LOADING);
        });
    });

    describe('View Only', () => {
        it('person name button should be disabled', async () => {
            ProductClient.getProductsForDate = jest.fn().mockResolvedValue({ data: [TestData.productForHank] })
            await renderTimeOnProduct(undefined, ({set}) => {
                set(ViewingDateState, new Date(2020, 0, 1))
                set(IsReadOnlyState, true)
                set(CurrentSpaceState, TestData.space )
            })
            await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalled())
            const hank = screen.getByText(TestData.hank.name);
            expect(hank).toBeDisabled();
        });
    });

    async function renderTimeOnProduct(initialState?:  PreloadedState<Partial<GlobalStateProps>>, initializeState?: (mutableSnapshot: MutableSnapshot) => void) {
        store = createStore(rootReducer, initialState, applyMiddleware(thunk));
        store.dispatch = jest.fn()
        renderWithRedux(
            <RecoilRoot initializeState={initializeState}>
                <MemoryRouter initialEntries={[`/${TestData.space.uuid}/timeonproduct`]}>
                    <Routes>
                        <Route path="/:teamUUID/timeonproduct" element={<>
                            <RecoilObserver
                                recoilState={ModalContentsState}
                                onChange={(value: ModalContents) => {
                                    modalContent = value;
                                }}
                            />
                            <TimeOnProduct/>
                        </>} />
                    </Routes>
                </MemoryRouter>
            </RecoilRoot>,
            store
        );
        await waitFor(() => expect(ProductClient.getProductsForDate).toHaveBeenCalled())
    }
});