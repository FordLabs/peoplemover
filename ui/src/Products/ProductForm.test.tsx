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
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import {Space} from '../Space/Space';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import ProductClient from '../Products/ProductClient';
import selectEvent from 'react-select-event';
import {Product} from './Product';
import {GlobalStateProps} from '../Redux/Reducers';
import moment from 'moment';
import {PreloadedState} from 'redux';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {ProductTagsState} from 'State/ProductTagsState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';
import {RecoilObserver} from '../Utils/RecoilObserver';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

jest.mock('Locations/LocationClient');
jest.mock('Tags/ProductTag/ProductTagClient');

describe('ProductForm', function() {
    let modalContent: ModalContents | null;

    const mockStore = configureStore([]);
    const store = mockStore({});

    let resetCreateRange: () => void;

    beforeEach(() => {
        resetCreateRange = TestUtils.mockCreateRange();

        LocationClient.get = jest.fn().mockResolvedValue({data: TestData.locations});
        ProductTagClient.get = jest.fn().mockResolvedValue({data: TestData.productTags});
        ProductClient.createProduct = jest.fn().mockResolvedValue({data: {}});

        modalContent = null;
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should close the modal when you click the cancel button', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2020, 4, 14))
                set(ModalContentsState, { title: 'Some Modal', component: <></> })
                set(CurrentSpaceState, TestData.space)
            }}>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ProductForm editing={false} />
            </RecoilRoot>,
            store
        );
        await waitFor(() => expect(LocationClient.get).toHaveBeenCalled());

        expect(modalContent).not.toBeNull();
        fireEvent.click(screen.getByText('Cancel'));
        expect(modalContent).toBeNull();
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should submit new product to backend and close modal', async () => {
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2020, 4, 14))
                set(ModalContentsState, { title: 'Some Modal', component: <></> })
                set(CurrentSpaceState, TestData.space)
            }}>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ProductForm editing={false} />
            </RecoilRoot>,
            store
        );

        fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Some Name'}});

        const locationLabelElement = await screen.findByLabelText('Location');
        await selectEvent.select(locationLabelElement, /Ann Arbor/);

        const tagsLabelElement = await screen.findByLabelText('Product Tags');
        await selectEvent.select(tagsLabelElement, /FordX/);

        expect(modalContent).not.toBeNull();
        fireEvent.click(screen.getByText('Add'));

        await waitFor(() => expect(ProductClient.createProduct).toHaveBeenCalledWith(
            TestData.space,
            {
                id: -1,
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                name: 'Some Name',
                startDate: '2020-05-14',
                endDate: '',
                spaceLocation: TestData.annarbor,
                archived: false,
                dorf: '',
                notes: '',
                url: '',
                tags: [TestData.productTag2],
                assignments: [],
            } as Product));

        expect(modalContent).toBeNull();
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should show delete modal without archive text when an archive product is being deleted', async () => {
        const archivedProduct = {...TestData.productWithoutLocation, endDate: '2020-02-02'};
        renderWithRedux(
            <RecoilRoot initializeState={({set}) => {
                set(ViewingDateState, new Date(2022, 3, 14))
                set(CurrentSpaceState, {
                    uuid: 'aaa-aaa-aaa-aaaaa',
                    id: 1,
                    name: 'Test Space',
                } as Space)
            }}>
                <ProductForm
                    editing={true}
                    product={archivedProduct}
                />
            </RecoilRoot>,
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
                set(CurrentSpaceState, TestData.space)
            }}>
                <ProductForm
                    editing={true}
                    product={TestData.productWithoutLocation}
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
                set(CurrentSpaceState, TestData.space)
            }}>
                <ProductForm editing={true} product={TestData.archivedProduct} />
            </RecoilRoot>,
            store
        );

        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(screen.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
        expect(screen.queryByText('You can also choose to archive this product to be able to access it later.')).toBeFalsy();
    });

    describe('Tag dropdowns', () => {
        const initialState: PreloadedState<Partial<GlobalStateProps>> = {
            allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
        };

        it('should show filter option when new location tag is created from edit product modal', async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, moment().toDate())
                    set(ProductsState, TestData.products)
                    set(ProductTagsState, TestData.productTags)
                    set(CurrentSpaceState, TestData.space)
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
                    set(CurrentSpaceState, TestData.space)
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
