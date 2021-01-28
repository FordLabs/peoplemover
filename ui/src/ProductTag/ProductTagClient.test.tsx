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

import Axios, {AxiosResponse} from 'axios';
import ProductTag from './ProductTagClient';
import TestUtils from '../tests/TestUtils';
import Cookies from 'universal-cookie';

describe('Product Tags Client', function() {
    const spaceUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const baseProductTagsUrl = `/api/spaces/${spaceUuid}/product-tags`;
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
            data: 'Created Product Tag',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Product Tag',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Product Tag',
        } as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Product Tags',
        } as AxiosResponse));
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should return all product tags for space', function(done) {
        ProductTag.get(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(baseProductTagsUrl, expectedConfig);
                expect(response.data).toBe('Get Product Tags');
                done();
            });

    });

    it('should create a product tag and return that product tag', function(done) {
        const expectedProductAddRequest = { name: TestUtils.productTag1.name };
        ProductTag.add(expectedProductAddRequest, TestUtils.space)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(baseProductTagsUrl, expectedProductAddRequest, expectedConfig);
                expect(response.data).toBe('Created Product Tag');
                done();
            });
    });

    it('should edit a product tag and return that product tag', function(done) {
        const expectedProductEditRequest = {
            id: TestUtils.productTag1.id,
            name: TestUtils.productTag1.name,
        };
        ProductTag.edit(expectedProductEditRequest, TestUtils.space)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(baseProductTagsUrl, expectedProductEditRequest, expectedConfig);
                expect(response.data).toBe('Updated Product Tag');
                done();
            });
    });

    it('should delete a product tag', function(done) {
        const expectedUrl = `${baseProductTagsUrl}/${TestUtils.productTag1.id}`;
        ProductTag.delete(TestUtils.productTag1.id, TestUtils.space)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Product Tag');
                done();
            });
    });
});
