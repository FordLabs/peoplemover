import ProductForm from '../Products/ProductForm';
import React from 'react';
import {fireEvent} from '@testing-library/dom';
import configureStore from 'redux-mock-store';
import {act, wait} from '@testing-library/react';
import TestUtils, {mockCreateRange, renderWithRedux} from '../tests/TestUtils';
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

describe('ProductForm', function() {
    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: TestUtils.space,
        viewingDate: new Date(2020, 4, 14),
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
        const app = renderWithRedux(<ProductForm editing={false} />, store, undefined);
        await act(async () => {fireEvent.click(app.getByText('Cancel'));});
        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        expect(LocationClient.get).toHaveBeenCalled();
        expect(ProductTagClient.get).toHaveBeenCalled();
    });

    it('should submit new product to backend and close modal', async () => {
        await act(async () => {
            const app = renderWithRedux(
                <ProductForm editing={false} />,
                store,
                undefined
            );
            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});

            const locationLabelElement = await app.findByLabelText('Location');
            await selectEvent.select(locationLabelElement, /Ann Arbor/);

            const tagsLabelElement = await app.findByLabelText('Product Tags');
            await selectEvent.select(tagsLabelElement, /FordX/);

            fireEvent.click(app.getByText('Add'));
        });

        expect(ProductClient.createProduct).toHaveBeenCalledWith(
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
                tags: [TestUtils.productTag2],
                assignments: [],
            } as Product);

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
            viewingDate: new Date(2022, 3, 14),
        });

        await act(async () => {
            const app = renderWithRedux(<ProductForm editing={true} product={TestUtils.productWithoutLocation}/>, store, undefined);
            const deleteSpan = await app.findByTestId('deleteProduct');
            fireEvent.click(deleteSpan);
            expect(app.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
            expect(app.queryByText('You can also choose to archive this product to be able to access it later.')).toBeNull();
        });
    });

    it('should show delete modal with archive text when a non-archived product is being deleted', async () => {
        await act(async () => {
            const app = renderWithRedux(<ProductForm editing={true} product={TestUtils.productWithoutLocation}/>, store, undefined);
            const deleteSpan = await app.findByTestId('deleteProduct');
            fireEvent.click(deleteSpan);
            expect(app.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
            expect(app.queryByText('You can also choose to archive this product to be able to access it later.')).toBeTruthy();
        });
    });

    it('should show delete modal without archive text when an archived product is being deleted', async () => {
        await act(async () => {
            const app = renderWithRedux(<ProductForm editing={true} product={TestUtils.archivedProduct}/>, store, undefined);
            const deleteSpan = await app.findByTestId('deleteProduct');
            fireEvent.click(deleteSpan);
            expect(app.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
            expect(app.queryByText('You can also choose to archive this product to be able to access it later.')).toBeFalsy();
        });
    });

    describe('tag dropdowns', () => {
        let history: History;
        let initialState = {
            isReadOnly: false,
            products: TestUtils.products,
            currentSpace: TestUtils.space,
            viewingDate: moment().toDate(),
            productTags: TestUtils.productTags,
            productSortBy: 'name',
            allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        } as GlobalStateProps;

        beforeEach(() => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            history = createBrowserHistory();
            history.push('/uuid');
        });
        it('should show filter option when new location tag is created from edit product modal', async () => {
            const app = renderWithRedux(<ProductForm editing={false} />, undefined, initialState);
            await act(async () => {
                const createOptionText = TestUtils.expectedCreateOptionText('Ahmedabad');
                await createTag('Location', createOptionText, 'Ahmedabad', app);
                const productForm = await app.findByTestId('productForm');

                await wait(() => {
                    expect(LocationClient.add).toBeCalledTimes(1);
                });
                expect(productForm).toHaveFormValues({location: '11'});
            });
            await app.findByText('Ahmedabad');
        });

        it('should show filter option when new product tag is created from edit product modal', async () => {
            const app = renderWithRedux(<ProductForm editing={false} />, undefined, initialState);

            await act(async () => {
                const expectedCreateOptionText = TestUtils.expectedCreateOptionText('Fin Tech');
                await createTag('Product Tags', expectedCreateOptionText, 'Fin Tech', app);
                expect(ProductTagClient.add).toBeCalledTimes(1);

                const productForm = await app.findByTestId('productForm');
                expect(productForm).toHaveFormValues({productTags: '9_Fin Tech'});
            });
            await app.findByText('Fin Tech');
        });
    });
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createTag(label: string, createOptionText: string, option: string, component: any): Promise<void> {
    const productTagsLabelElement = await component.findByLabelText(label);
    const containerToFindOptionsIn = {
        container: await component.findByTestId('productForm'),
        createOptionText,
    };
    await selectEvent.create(productTagsLabelElement, option, containerToFindOptionsIn);
}
