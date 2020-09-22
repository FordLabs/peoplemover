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
import Cookies from 'universal-cookie';
import RoleClient from './RoleClient';

describe('Role Client', function() {
    const baseUrl = `/api/role`;
    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(function() {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({} as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should get all roles in a space', function(done) {
        const expectedUrl = `${baseUrl}/spaceUUID`;
        RoleClient.get('spaceUUID').then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });

    it('should add a role to a space', function(done) {
        const expectedUrl = `${baseUrl}/spaceUUID`;
        const expectedData = {name:'bob'};
        RoleClient.add(expectedData, 'spaceUUID').then(() => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
            done();
        });
    });

    it('should edit a role in a space', function(done) {
        const expectedUrl = `${baseUrl}/spaceUUID`;
        const expectedData = {id: 1, name:'bob'};
        RoleClient.edit(expectedData, 'spaceUUID').then(() => {
            expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
            done();
        });
    });

    it('should delete a role in a space', function(done) {
        const expectedUrl = `${baseUrl}/1`;
        RoleClient.delete(1).then(() => {
            expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });

});
