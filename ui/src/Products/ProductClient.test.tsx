/*
 * Copyright (c) 2020 Ford Motor Company
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

import Axios, {AxiosResponse} from 'axios';
import ProductClient from '../Products/ProductClient';
import TestUtils from '../tests/TestUtils';

describe('Product Client', function() {

    const spaceUuid = 'uuid';
    const baseProductsUrl = `/api/space/${spaceUuid}/products/`;

    beforeEach(() => {
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

    it('should create a product and return that product', function(done) {
        const expectedUrl = baseProductsUrl;
        ProductClient.createProduct(spaceUuid, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, TestUtils.productWithAssignments);
                expect(response.data).toBe('Created Product');
                done();
            });
    });

    it('should update a product and return that product', function(done) {
        const expectedUrl = baseProductsUrl + TestUtils.productWithAssignments.id;
        ProductClient.editProduct(spaceUuid, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, TestUtils.productWithAssignments);
                expect(response.data).toBe('Updated Product');
                done();
            });
    });

    it('should delete a product', function(done) {
        const expectedUrl = baseProductsUrl + TestUtils.productWithAssignments.id;
        ProductClient.deleteProduct(spaceUuid, TestUtils.productWithAssignments)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl);
                expect(response.data).toBe('Deleted Product');
                done();
            });
    });

    it('should return the products given a date', function(done) {
        const date = '2019-01-10';
        const expectedUrl = baseProductsUrl + date;
        const expectedConfig = {
            headers: { 'Content-Type': 'application/json' },
        };
        ProductClient.getProductsForDate(spaceUuid, new Date(2019, 0, 10))
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Get Products');
                done();
            });

    });
});
