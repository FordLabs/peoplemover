import ProductForm from '../Products/ProductForm';
import React from 'react';
import {fireEvent} from '@testing-library/dom';
import configureStore from 'redux-mock-store';
import {act, render} from '@testing-library/react';
import {Provider} from 'react-redux';
import TestUtils from './TestUtils';
import {Space} from '../SpaceDashboard/Space';
import {AvailableActions} from '../Redux/Actions';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import ProductTagClient from '../ProductTag/ProductTagClient';
import ProductClient from '../Products/ProductClient';
import selectEvent from 'react-select-event';
import {Product} from '../Products/Product';

describe('ProductForm', function() {
    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: {
            id: 1,
            name: 'Test Space',
        } as Space,
    });
    store.dispatch = jest.fn();

    const locationPromise: Promise<AxiosResponse> = Promise.resolve({data: TestUtils.locations} as AxiosResponse);
    const productTagPromise = Promise.resolve({data: TestUtils.productTags} as AxiosResponse);
    const createProductPromise = Promise.resolve({data: {}} as AxiosResponse);

    LocationClient.get = jest.fn(() => locationPromise);
    ProductTagClient.get = jest.fn(() => productTagPromise);
    ProductClient.createProduct = jest.fn(() => createProductPromise);

    it('should close the modal when you click the cancel button', async () => {
        const app = render(<Provider store={store}><ProductForm editing={false} spaceId={1} /></Provider>);
        fireEvent.click(app.getByText('Cancel'));
        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        await act(async () => {await locationPromise;});
        await act(async () => {await productTagPromise;});
    });

    it('should submit new product to backend and close model', async () => {
        const app = render(<Provider store={store}><ProductForm editing={false} spaceId={1} /></Provider>);
        fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});

        const locationLabelElement = await app.findByLabelText('Location');
        await selectEvent.select(locationLabelElement, /Ann Arbor/);

        const tagsLabelElement = await app.findByLabelText('Product Tags');
        await selectEvent.select(tagsLabelElement, /FordX/);

        fireEvent.change(app.getByLabelText('Start Date'), {target: {value: '2010-01-30'}});
        fireEvent.change(app.getByLabelText('End Date'), {target: {value: '2020-01-30'}});

        fireEvent.click(app.getByText('Create'));

        expect(store.dispatch).toHaveBeenCalledWith({type: AvailableActions.CLOSE_MODAL});
        expect(ProductClient.createProduct).toHaveBeenCalledWith({
            id: -1,
            spaceId: 1,
            name: 'Some Name',
            startDate: '2010-01-30',
            endDate: '2020-01-30',
            spaceLocation: TestUtils.annarbor,
            archived: false,
            dorf: '',
            notes: '',
            productTags: [TestUtils.productTag2],
            assignments: [],
        } as Product);

        await act(async () => {await locationPromise;});
        await act(async () => {await productTagPromise;});
    });
});
