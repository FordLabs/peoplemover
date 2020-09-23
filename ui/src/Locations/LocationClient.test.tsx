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
import LocationClient from './LocationClient';
import TestUtils from '../tests/TestUtils';
import Cookies from 'universal-cookie';

describe('Location Client', function() {
    const spaceUuid = 'uuid';
    const baseLocationsUrl = `/api/spaces/${spaceUuid}/locations`;

    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Created Location',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Location',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Location',
        } as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Locations',
        } as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should return all locations for space', function(done) {
        LocationClient.get(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(baseLocationsUrl,expectedConfig);
                expect(response.data).toBe('Get Locations');
                done();
            });

    });

    it('should create a location and return that location', function(done) {
        const expectedLocationAddRequest = { name: TestUtils.annarbor.name };
        LocationClient.add(expectedLocationAddRequest, spaceUuid)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(baseLocationsUrl, expectedLocationAddRequest, expectedConfig);
                expect(response.data).toBe('Created Location');
                done();
            });
    });

    it('should update a location and return that location', function(done) {
        const expectedLocationEditRequest = {
            id: TestUtils.annarbor.id,
            name: TestUtils.annarbor.name,
        };
        LocationClient.edit(expectedLocationEditRequest, spaceUuid)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(baseLocationsUrl, expectedLocationEditRequest,expectedConfig);
                expect(response.data).toBe('Updated Location');
                done();
            });
    });

    it('should delete a location', function(done) {
        const expectedUrl = `${baseLocationsUrl}/${TestUtils.annarbor.id}`;
        LocationClient.delete(TestUtils.annarbor.id, spaceUuid)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Location');
                done();
            });
    });
});
