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
import ProductForm from './ProductForm';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import TestUtils, { renderWithRecoil } from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import { Space } from 'Types/Space';
import LocationClient from 'Services/Api/LocationClient';
import ProductTagClient from 'Services/Api/ProductTagClient';
import ProductClient from 'Services/Api/ProductClient';
import selectEvent from 'react-select-event';
import { ViewingDateState } from 'State/ViewingDateState';
import { ModalContents, ModalContentsState } from 'State/ModalContentsState';
import { RecoilObserver } from 'Utils/RecoilObserver';
import { CurrentSpaceState } from 'State/CurrentSpaceState';
import { MutableSnapshot } from 'recoil';
import { Product } from 'Types/Product';

jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/ProductTagClient');

describe('ProductForm', function () {
    let modalContent: ModalContents | null;
    let resetCreateRange: () => void;
    const recoilState = ({ set }: MutableSnapshot) => {
        set(ViewingDateState, new Date(2020, 4, 14));
        set(ModalContentsState, { title: 'Some Modal', component: <></> });
        set(CurrentSpaceState, TestData.space);
    };

    beforeEach(() => {
        resetCreateRange = TestUtils.mockCreateRange();
        modalContent = null;
    });

    afterEach(() => {
        resetCreateRange();
    });

    it('should have correct placeholder text', async () => {
        renderWithRecoil(
            <ProductForm
                editing={false}
                product={TestData.productWithoutLocation}
            />,
            recoilState
        );
        await screen.findByLabelText('Name');

        await screen.findByPlaceholderText('e.g. Product 1');
        await screen.findByText('Add product tags');
        await screen.findByText('Add a location tag');

        expect(screen.getByTestId('productFormUrlField')).toHaveAttribute(
            'placeholder',
            'e.g. https://www.fordlabs.com'
        );
    });

    it('should close the modal when you click the cancel button', async () => {
        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ProductForm editing={false} />
            </>,
            recoilState
        );
        await waitFor(() => expect(LocationClient.get).toHaveBeenCalled());

        expect(modalContent).not.toBeNull();
        fireEvent.click(screen.getByText('Cancel'));
        expect(modalContent).toBeNull();
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should submit new product to backend and close modal', async () => {
        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ProductForm editing={false} />
            </>,
            recoilState
        );

        fireEvent.change(screen.getByLabelText('Name'), {
            target: { value: 'Some Name' },
        });

        const locationLabelElement = await screen.findByLabelText('Location');
        await selectEvent.select(locationLabelElement, /Ann Arbor/);

        const tagsLabelElement = await screen.findByLabelText('Product Tags');
        await selectEvent.select(tagsLabelElement, /FordX/);

        expect(modalContent).not.toBeNull();
        fireEvent.click(screen.getByText('Add'));

        await waitFor(() =>
            expect(ProductClient.createProduct).toHaveBeenCalledWith(
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
                } as Product
            )
        );

        expect(modalContent).toBeNull();
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should show delete modal without archive text when an archive product is being deleted', async () => {
        const archivedProduct = {
            ...TestData.productWithoutLocation,
            endDate: '2020-02-02',
        };
        renderWithRecoil(
            <ProductForm editing={true} product={archivedProduct} />,
            ({ set }) => {
                set(ViewingDateState, new Date(2022, 3, 14));
                set(CurrentSpaceState, {
                    uuid: 'aaa-aaa-aaa-aaaaa',
                    id: 1,
                    name: 'Test Space',
                } as Space);
            }
        );
        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(
            screen.getByText(
                'Deleting this product will permanently remove it from this space.'
            )
        ).toBeTruthy();
        expect(
            screen.queryByText(
                'You can also choose to archive this product to be able to access it later.'
            )
        ).toBeNull();
    });

    it('should show delete modal with archive text when a non-archived product is being deleted', async () => {
        renderWithRecoil(
            <ProductForm
                editing={true}
                product={TestData.productWithoutLocation}
            />,
            recoilState
        );
        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(
            screen.getByText(
                'Deleting this product will permanently remove it from this space.'
            )
        ).toBeTruthy();
        expect(
            screen.queryByText(
                'You can also choose to archive this product to be able to access it later.'
            )
        ).toBeTruthy();
    });

    it('should show delete modal without archive text when an archived product is being deleted', async () => {
        renderWithRecoil(
            <ProductForm editing={true} product={TestData.archivedProduct} />,
            recoilState
        );

        const deleteSpan = await screen.findByTestId('deleteProduct');
        fireEvent.click(deleteSpan);
        expect(
            screen.getByText(
                'Deleting this product will permanently remove it from this space.'
            )
        ).toBeTruthy();
        expect(
            screen.queryByText(
                'You can also choose to archive this product to be able to access it later.'
            )
        ).toBeFalsy();
    });

    describe('Tag dropdowns', () => {
        it('should show filter option when new location tag is created from edit product modal', async () => {
            renderWithRecoil(<ProductForm editing={false} />, recoilState);
            const createOptionText =
                TestUtils.expectedCreateOptionText('Ahmedabad');
            await createTag('Location', createOptionText, 'Ahmedabad');
            const productForm = await screen.findByTestId('productForm');

            await waitFor(() => expect(LocationClient.add).toBeCalledTimes(1));
            expect(productForm).toHaveFormValues({ location: '11' });
            await screen.findByText('Ahmedabad');
        });

        it('should show filter option when new product tag is created from edit product modal', async () => {
            renderWithRecoil(<ProductForm editing={false} />, recoilState);

            const expectedCreateOptionText =
                TestUtils.expectedCreateOptionText('Fin Tech');
            await createTag(
                'Product Tags',
                expectedCreateOptionText,
                'Fin Tech'
            );
            expect(ProductTagClient.add).toBeCalledTimes(1);

            const productForm = await screen.findByTestId('productForm');
            expect(productForm).toHaveFormValues({ productTags: '9_Fin Tech' });
            await screen.findByText('Fin Tech');
        });
    });
});

async function createTag(
    label: string,
    createOptionText: string,
    option: string
): Promise<void> {
    const productTagsLabelElement = await screen.findByLabelText(label);
    const containerToFindOptionsIn = {
        container: await screen.findByTestId('productForm'),
        createOptionText,
    };
    await selectEvent.create(
        productTagsLabelElement,
        option,
        containerToFindOptionsIn
    );
}
