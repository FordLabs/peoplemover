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
import TestData from '../../Utils/TestData';
import Cookies from 'universal-cookie';
import Axios from 'axios';

jest.mock('axios');

describe('Product Client', function () {
    const baseProductsUrl = `/api/spaces/${TestData.space.uuid}/products`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 123456',
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

    it('should create a product and return that product', function (done) {
        const expectedUrl = baseProductsUrl;
        ProductClient.createProduct(
            TestData.space,
            TestData.productWithAssignments
        ).then((response) => {
            expect(Axios.post).toHaveBeenCalledWith(
                expectedUrl,
                TestData.productWithAssignments,
                expectedConfig
            );
            expect(response.data).toBe('Created Product');
            done();
        });
    });

    it('should update a product and return that product', function (done) {
        const expectedUrl = `${baseProductsUrl}/${TestData.productWithAssignments.id}`;
        ProductClient.editProduct(
            TestData.space,
            TestData.productWithAssignments
        ).then((response) => {
            expect(Axios.put).toHaveBeenCalledWith(
                expectedUrl,
                TestData.productWithAssignments,
                expectedConfig
            );
            expect(response.data).toBe('Updated Product');
            done();
        });
    });

    it('should delete a product', function (done) {
        const expectedUrl = `${baseProductsUrl}/${TestData.productWithAssignments.id}`;
        ProductClient.deleteProduct(
            TestData.space,
            TestData.productWithAssignments
        ).then((response) => {
            expect(Axios.delete).toHaveBeenCalledWith(
                expectedUrl,
                expectedConfig
            );
            expect(response.data).toBe('Deleted Product');
            done();
        });
    });

    it('should return the products given a date', function (done) {
        const date = '2019-01-10';
        const expectedUrl = baseProductsUrl + `?requestedDate=${date}`;
        const spaceUuid = TestData?.space?.uuid || '';
        ProductClient.getProductsForDate(spaceUuid, new Date(2019, 0, 10)).then(
            (response) => {
                expect(Axios.get).toHaveBeenCalledWith(
                    expectedUrl,
                    expectedConfig
                );
                expect(response.data).toBe('Get Products');
                done();
            }
        );
    });
});
