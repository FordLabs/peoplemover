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

import Cookies from 'universal-cookie';
import ProductTagClient from './ProductTagClient';
import TestUtils from '../tests/TestUtils';
import Axios, {AxiosResponse} from 'axios';

describe('Product Tag Client', function() {

    const spaceUuid = 'uuid';
    const productTagsUrl = `/api/producttag/${spaceUuid}`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };
    const cookies = new Cookies();
    let originalWindow: Window;

    beforeEach(() => {
        originalWindow = window;
        delete window.location;
        (window as Window) = Object.create(window);
        cookies.set('accessToken', '123456');
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Product Tags',
        } as AxiosResponse));
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Add Product Tags',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Edit Product Tags',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Delete Product Tags',
        } as AxiosResponse));
    });

    afterEach(() => {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should get product tags for a given space uuid', function(done) {
        const expectedUrl = productTagsUrl;
        ProductTagClient.get(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Get Product Tags');
                done();
            });
    });

    it('should add product tags for a given space uuid', function(done) {
        const expectedUrl = productTagsUrl;
        const expectedProductTag = TestUtils.productTag1;
        ProductTagClient.add(expectedProductTag, spaceUuid)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedProductTag, expectedConfig);
                expect(response.data).toBe('Add Product Tags');
                done();
            });
    });

    it('should edit product tags for a given space uuid', function(done) {
        const expectedUrl = productTagsUrl;
        const expectedProductTag = TestUtils.productTag1;
        ProductTagClient.edit(expectedProductTag, spaceUuid)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedProductTag, expectedConfig);
                expect(response.data).toBe('Edit Product Tags');
                done();
            });
    });

    it('should delete product tags for a given space uuid', function(done) {
        window.location = {href: '', pathname: `/${spaceUuid}`} as Location;
        const productTagID = 1234;
        const expectedUrl = productTagsUrl + '/' + productTagID.toString();
        ProductTagClient.delete(productTagID)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Delete Product Tags');
                done();
            });
    });
});
