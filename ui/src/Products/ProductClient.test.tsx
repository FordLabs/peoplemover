import ProductClient from './ProductClient';
import {Product} from './Product';
import axios, {AxiosResponse} from 'axios';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import TestUtils from "../tests/TestUtils";
import Cookies from "universal-cookie";
import Axios from "axios";

jest.mock('axios');
declare let window: MatomoWindow;

describe('Product Client', function() {
    const baseProductsUrl = `/api/spaces/${TestUtils.space.uuid}/products`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };
    const cookies = new Cookies();


    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Created Product',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Product',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Product',
        } as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Products',
        } as AxiosResponse));
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should create a product and return that product', function(done) {
        const expectedUrl = baseProductsUrl;
        ProductClient.createProduct(TestUtils.space, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, TestUtils.productWithAssignments, expectedConfig);
                expect(response.data).toBe('Created Product');
                done();
            });
    });

    it('should update a product and return that product', function(done) {
        const expectedUrl = `${baseProductsUrl}/${TestUtils.productWithAssignments.id}`;
        ProductClient.editProduct(TestUtils.space, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, TestUtils.productWithAssignments, expectedConfig);
                expect(response.data).toBe('Updated Product');
                done();
            });
    });

    it('should delete a product', function(done) {
        const expectedUrl = `${baseProductsUrl}/${TestUtils.productWithAssignments.id}`;
        ProductClient.deleteProduct(TestUtils.space, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Product');
                done();
            });
    });

    it('should return the products given a date', function(done) {
        const date = '2019-01-10';
        const expectedUrl = baseProductsUrl + `?requestedDate=${date}`;
        ProductClient.getProductsForDate(TestUtils.space.uuid!!, new Date(2019, 0, 10))
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Get Products');
                done();
            });

    });

    describe('Matomo', () => {

        let originalWindow: Window;
        const expectedName = 'Floam';
        const product: Product = {
            archived: false,
            assignments: [],
            id: 0,
            name: expectedName,
            productTags: [],
            spaceId: 0,
        };

        beforeEach(() => {
            originalWindow = window;
        });

        afterEach(() => {
            (window as Window) = originalWindow;
        });

        it('should push create product action on create', async () => {
            const expectedResponse = {};
            axios.post = jest.fn(() => Promise.resolve(expectedResponse as any));

            const axiosResponse = await ProductClient.createProduct(TestUtils.space, product);

            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'createProduct', expectedName]);

        });

        it('should push createError on create with failure code', async () => {
            const expectedResponse = {code: 417};
            axios.post = jest.fn(() => Promise.reject(expectedResponse as any));

            try {
                await ProductClient.createProduct(TestUtils.space, product);
                fail('Did not catch an exception from the product creation');
            } catch (err)  {
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'createProductError', expectedName, expectedResponse.code]);
            }

        });

        it('should push delete product action on delete', async () => {
            const expectedResponse = {};
            axios.delete = jest.fn(() => Promise.resolve(expectedResponse as any));

            const axiosResponse = await ProductClient.deleteProduct(TestUtils.space, product);

            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'deleteProduct', expectedName]);

        });

        it('should push edit product action on edit', async () => {
            const expectedResponse = {};
            axios.put = jest.fn(() => Promise.resolve(expectedResponse as any));

            const axiosResponse = await ProductClient.editProduct(TestUtils.space, product);

            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'editProduct', expectedName]);

        });
    });
});