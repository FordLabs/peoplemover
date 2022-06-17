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
import ProductForm from '../Products/ProductForm';
import React from 'react';
import configureStore from 'redux-mock-store';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import TestUtils, {mockCreateRange, renderWithRedux} from '../Utils/TestUtils';
import {Space} from '../Space/Space';
import {AvailableActions} from '../Redux/Actions';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import ProductClient from '../Products/ProductClient';
import selectEvent from 'react-select-event';
import {Product} from './Product';
import {createBrowserHistory, History} from 'history';
import {GlobalStateProps} from '../Redux/Reducers';
import moment from 'moment';
import {PreloadedState} from 'redux';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';

describe('ProductForm', function() {
    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: TestUtils.space,
    });

    let resetCreateRange: () => void;

    beforeEach(() => {
        store.dispatch = jest.fn();
        resetCreateRange = mockCreateRange();

        LocationClient.get = jest.fn().mockResolvedValue({data: TestUtils.locations});
        ProductTagClient.get = jest.fn().mockResolvedValue({data: TestUtils.productTags});
        ProductClient.createProduct = jest.fn().mockResolvedValue({data: {}});
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should close the modal when you click the cancel button', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2020, 4, 14))
            }}>
                <ProductForm editing={false} />
            </RecoilRoot>,
            store
        );
        await waitFor(() => expect(LocationClient.get).toHaveBeenCalled());

        fireEvent.click(screen.getByText('Cancel'));
        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should submit new product to backend and close modal', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2020, 4, 14))
            }}>
                <ProductForm editing={false} />
            </RecoilRoot>,
            store
        );

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Some Name'}});

        const locationLabelElement = await screen.findByLabelText('Location');
        await selectEvent.select(locationLabelElement, /Ann Arbor/);

        const tagsLabelElement = await screen.findByLabelText('Product Tags');
        await selectEvent.select(tagsLabelElement, /FordX/);

        fireEvent.click(screen.getByText('Add'));

        await waitFor(() => expect(ProductClient.createProduct).toHaveBeenCalledWith(
            TestUtils.space,
            {
                id: -1,
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                name: 'Some Name',
                startDate: '2020-05-14',
                endDate: '',
                spaceLocation: TestUtils.annarbor,
                archived: false,
                dorf: '',
                notes: '',
                url: '',
                tags: [TestUtils.productTag2],
                assignments: [],
            } as Product));

        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should show delete modal without archive text when an archive product is being deleted', async () => {
        const store = mockStore({
            currentSpace: {
                uuid: 'aaa-aaa-aaa-aaaaa',
                id: 1,
                name: 'Test Space',
            } as Space,
        });

        const archivedProduct = {...TestUtils.productWithoutLocation, endDate: '2020-02-02'};
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2022, 3, 14))
            }}>
                <ProductForm
                    editing={true}
                    product={archivedProduct}
                />
            </RecoilRoot>,
            store
        );
        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(screen.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
        expect(screen.queryByText('You can also choose to archive this product to be able to access it later.')).toBeNull();
    });

    it('should show delete modal with archive text when a non-archived product is being deleted', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2022, 3, 14))
            }}>
                <ProductForm
                    editing={true}
                    product={TestUtils.productWithoutLocation}
                />
            </RecoilRoot>,
            store
        );
        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(screen.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
        expect(screen.queryByText('You can also choose to archive this product to be able to access it later.')).toBeTruthy();
    });

    it('should show delete modal without archive text when an archived product is being deleted', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2020, 4, 14))
            }}>
                <ProductForm editing={true} product={TestUtils.archivedProduct} />
            </RecoilRoot>,
            store
        );

        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(screen.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
        expect(screen.queryByText('You can also choose to archive this product to be able to access it later.')).toBeFalsy();
    });

    describe('tag dropdowns', () => {
        let history: History;
        const initialState: PreloadedState<Partial<GlobalStateProps>> = {
            currentSpace: TestUtils.space,
            productTags: TestUtils.productTags,
            allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        };

        beforeEach(() => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            history = createBrowserHistory();
            history.push('/uuid');
        });

        it('should show filter option when new location tag is created from edit product modal', async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, moment().toDate())
                    set(ProductsState, TestUtils.products)
                }}>
                    <ProductForm editing={false} />
                </RecoilRoot>,
                undefined,
                initialState
            );
            const createOptionText = TestUtils.expectedCreateOptionText('Ahmedabad');
            await createTag('Location', createOptionText, 'Ahmedabad');
            const productForm = await screen.findByTestId('productForm');

            await waitFor(() => {
                expect(LocationClient.add).toBeCalledTimes(1);
            });
            expect(productForm).toHaveFormValues({location: '11'});
            await screen.findByText('Ahmedabad');
        });

        it('should show filter option when new product tag is created from edit product modal', async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, moment().toDate())
                }}>
                    <ProductForm editing={false} />
                </RecoilRoot>,
                undefined,
                initialState
            );

            const expectedCreateOptionText = TestUtils.expectedCreateOptionText('Fin Tech');
            await createTag('Product Tags', expectedCreateOptionText, 'Fin Tech');
            expect(ProductTagClient.add).toBeCalledTimes(1);

            const productForm = await screen.findByTestId('productForm');
            expect(productForm).toHaveFormValues({productTags: '9_Fin Tech'});
            await screen.findByText('Fin Tech');
        });
    });
});

async function createTag(label: string, createOptionText: string, option: string): Promise<void> {
    const productTagsLabelElement = await screen.findByLabelText(label);
    const containerToFindOptionsIn = {
        container: await screen.findByTestId('productForm'),
        createOptionText,
    };
    await selectEvent.create(productTagsLabelElement, option, containerToFindOptionsIn);
}
