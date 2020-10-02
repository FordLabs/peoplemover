import ProductForm from '../Products/ProductForm';
import React from 'react';
import {fireEvent} from '@testing-library/dom';
import configureStore from 'redux-mock-store';
import {act} from '@testing-library/react';
import TestUtils, {mockCreateRange, renderWithRedux} from '../tests/TestUtils';
import {Space} from '../SpaceDashboard/Space';
import {AvailableActions} from '../Redux/Actions';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ProductClient from '../Products/ProductClient';
import selectEvent from 'react-select-event';
import {Product} from './Product';

describe('ProductForm', function() {
    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: {
            uuid: 'aaa-aaa-aaa-aaaaa',
            id: 1,
            name: 'Test Space',
        } as Space,
        viewingDate: new Date(2020, 4, 14),
    });

    let resetCreateRange: () => void;

    beforeEach(() => {
        store.dispatch = jest.fn();
        resetCreateRange = mockCreateRange();
    });

    afterEach(() => {
        resetCreateRange();
    });

    const locationPromise: Promise<AxiosResponse> = Promise.resolve({data: TestUtils.locations} as AxiosResponse);
    const productTagPromise = Promise.resolve({data: TestUtils.productTags} as AxiosResponse);
    const createProductPromise = Promise.resolve({data: {}} as AxiosResponse);

    LocationClient.get = jest.fn(() => locationPromise);
    ProductTagClient.get = jest.fn(() => productTagPromise);
    ProductClient.createProduct = jest.fn(() => createProductPromise);

    it('should close the modal when you click the cancel button', async () => {
        const app = renderWithRedux(<ProductForm editing={false} />, store, undefined);
        await act(async () => {fireEvent.click(app.getByText('Cancel'));});
        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        await act(async () => {await locationPromise;});
        await act(async () => {await productTagPromise;});
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

            fireEvent.click(app.getByText('Create'));
        });

        expect(ProductClient.createProduct).toHaveBeenCalledWith(
            'aaa-aaa-aaa-aaaaa',
            {
                id: -1,
                spaceId: 1,
                name: 'Some Name',
                startDate: '2020-05-14',
                endDate: '',
                spaceLocation: TestUtils.annarbor,
                archived: false,
                dorf: '',
                notes: '',
                productTags: [TestUtils.productTag2],
                assignments: [],
            } as Product);

        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});

        await act(async () => {await locationPromise;});
        await act(async () => {await productTagPromise;});
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

    it('should show delete modal with archive text when an archive product is being deleted', async () => {
        await act(async () => {
            const app = renderWithRedux(<ProductForm editing={true} product={TestUtils.productWithoutLocation}/>, store, undefined);
            const deleteSpan = await app.findByTestId('deleteProduct');
            fireEvent.click(deleteSpan);
            expect(app.getByText('Deleting this product will permanently remove it from this space.')).toBeTruthy();
            expect(app.queryByText('You can also choose to archive this product to be able to access it later.')).toBeTruthy();
        });
    });
});
