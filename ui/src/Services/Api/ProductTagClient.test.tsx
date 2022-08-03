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

import Axios from 'axios';
import ProductTag from './ProductTagClient';
import TestData from '../../Utils/TestData';
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

        Axios.post = jest.fn().mockResolvedValue({ data: 'Created Product Tag' });
        Axios.put = jest.fn().mockResolvedValue({ data: 'Updated Product Tag' });
        Axios.delete = jest.fn().mockResolvedValue({ data: 'Deleted Product Tag' });
        Axios.get = jest.fn().mockResolvedValue({ data: 'Get Product Tags' });
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
        const expectedProductAddRequest = { name: TestData.productTag1.name };
        ProductTag.add(expectedProductAddRequest, TestData.space)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(baseProductTagsUrl, expectedProductAddRequest, expectedConfig);
                expect(response.data).toBe('Created Product Tag');
                done();
            });
    });

    it('should edit a product tag and return that product tag', function(done) {
        const expectedProductEditRequest = {
            id: TestData.productTag1.id,
            name: TestData.productTag1.name,
        };
        ProductTag.edit(expectedProductEditRequest, TestData.space)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(`${baseProductTagsUrl}/${TestData.productTag1.id}`, expectedProductEditRequest, expectedConfig);
                expect(response.data).toBe('Updated Product Tag');
                done();
            });
    });

    it('should delete a product tag', function(done) {
        const expectedUrl = `${baseProductTagsUrl}/${TestData.productTag1.id}`;
        ProductTag.delete(TestData.productTag1.id, TestData.space)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Product Tag');
                done();
            });
    });
});
