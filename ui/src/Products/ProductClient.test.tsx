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

import ProductClient from './ProductClient';
import {Product} from './Product';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import TestUtils from '../tests/TestUtils';
import Cookies from 'universal-cookie';
import Axios from 'axios';

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
        Axios.post = jest.fn().mockResolvedValue({
            data: 'Created Product',
        });
        Axios.put = jest.fn().mockResolvedValue({
            data: 'Updated Product',
        });
        Axios.delete = jest.fn().mockResolvedValue({
            data: 'Deleted Product',
        });
        Axios.get = jest.fn().mockResolvedValue({
            data: 'Get Products',
        });
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
        const spaceUuid = TestUtils?.space?.uuid || '';
        ProductClient.getProductsForDate(spaceUuid, new Date(2019, 0, 10))
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
            tags: [],
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        };

        beforeEach(() => {
            originalWindow = window;
        });

        afterEach(() => {
            (window as Window) = originalWindow;
        });

        it('should push create product action on create', async () => {
            const expectedResponse = { post: true };
            Axios.post = jest.fn().mockResolvedValue(expectedResponse);

            const axiosResponse = await ProductClient.createProduct(TestUtils.space, product);
            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'createProduct', expectedName]);
        });

        it('should push createError on create with failure code', (done) => {
            const expectedResponse = { code: 417 };
            Axios.post = jest.fn().mockRejectedValue(expectedResponse);

            ProductClient.createProduct(TestUtils.space, product).catch(() => {
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'createProductError', expectedName, expectedResponse.code]);
                done()
            });
        });

        it('should push delete product action on delete', async () => {
            const expectedResponse = { delete: true };
            Axios.delete = jest.fn().mockResolvedValue(expectedResponse);

            const axiosResponse = await ProductClient.deleteProduct(TestUtils.space, product);
            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'deleteProduct', expectedName]);
        });

        it('should push edit product action on edit', async () => {
            const expectedResponse = { put: true };
            Axios.put = jest.fn().mockResolvedValue(expectedResponse);

            const axiosResponse = await ProductClient.editProduct(TestUtils.space, product);
            expect(axiosResponse).toBe(expectedResponse);

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'editProduct', expectedName]);
        });
    });
});
