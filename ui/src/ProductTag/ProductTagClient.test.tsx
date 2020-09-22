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
import ProductTag from './ProductTagClient';
import TestUtils from '../tests/TestUtils';

describe('Product Tags Client', function() {
    const spaceUuid = 'uuid';
    const baseProductTagsUrl = `/api/spaces/${spaceUuid}/product-tags`;

    beforeEach(() => {
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

    it('should return all product tags for space', function(done) {
        ProductTag.get(spaceUuid)
            .then((response) => {
                const expectedConfig = { headers: { 'Content-Type': 'application/json' } };
                expect(Axios.get).toHaveBeenCalledWith(baseProductTagsUrl, expectedConfig);
                expect(response.data).toBe('Get Product Tags');
                done();
            });

    });

    it('should create a product tag and return that product tag', function(done) {
        const expectedProductAddRequest = { name: TestUtils.productTag1.name };
        ProductTag.add(expectedProductAddRequest, spaceUuid)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(baseProductTagsUrl, expectedProductAddRequest);
                expect(response.data).toBe('Created Product Tag');
                done();
            });
    });

    it('should edit a product tag and return that product tag', function(done) {
        const expectedProductEditRequest = {
            id: TestUtils.productTag1.id,
            name: TestUtils.productTag1.name,
        };
        ProductTag.edit(expectedProductEditRequest, spaceUuid)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(baseProductTagsUrl, expectedProductEditRequest);
                expect(response.data).toBe('Updated Product Tag');
                done();
            });
    });

    it('should delete a product tag', function(done) {
        const expectedUrl = `${baseProductTagsUrl}/${TestUtils.productTag1.id}`;
        ProductTag.delete(TestUtils.productTag1.id, spaceUuid)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl);
                expect(response.data).toBe('Deleted Product Tag');
                done();
            });
    });
});
