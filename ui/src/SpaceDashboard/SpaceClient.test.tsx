/*
 *
 *  * Copyright (c) 2019 Ford Motor Company
 *  * All rights reserved.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import Axios, {AxiosResponse} from 'axios';
import SpaceClient from './SpaceClient';
import Cookies from 'universal-cookie';
import {SpaceWithAccessTokenResponse} from './SpaceWithAccessTokenResponse';
import {createEmptySpace} from './Space';

describe('Space Client', function() {
    beforeEach(function() {
        const cookies = new Cookies();
        cookies.set('accessToken', '123456');
    });

    afterEach(function() {
        const cookies = new Cookies();
        cookies.remove('accessToken');
    });

    it('should return the space given a user', function() {
        Axios.get = jest.fn();

        const expectedUrl = '/api/user/space';
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };

        SpaceClient.getSpacesForUser();

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should return the space given a space name', function() {
        Axios.get = jest.fn();

        const expectedUrl = '/api/space/testName';
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };

        SpaceClient.getSpaceFromUuid('testName');

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });

    it('should create a space given a space name', async () => {
        const expectedresponse = {} as Promise<AxiosResponse<SpaceWithAccessTokenResponse>>;
        const expectedUrl = '/api/user/space';
        const expectedBody = {spaceName: 'bob'};
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };

        Axios.post = jest.fn().mockImplementation((url, data, config) => {
            let urlMatches = url === expectedUrl;
            let bodyMatches = JSON.stringify(data) === JSON.stringify(expectedBody);
            let headersMatch = JSON.stringify(config) === JSON.stringify(expectedConfig);
            if (urlMatches && bodyMatches && headersMatch) {
                return expectedresponse;
            }
            return null;
        });

        const actual = await SpaceClient.createSpaceForUser('bob');

        expect(actual).toBe(expectedresponse);
    });

    it('should edit space given space uuid and content', async () => {
        const expectedresponse = {} as Promise<AxiosResponse>;
        const expectedUrl = '/api/space/uuidbob';
        const expectedSpace =  createEmptySpace();
        const expectedBody = {editedSpace: expectedSpace};
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };

        Axios.put = jest.fn().mockImplementation((url, data, config) => {
            let urlMatches = url === expectedUrl;
            let headersMatch = JSON.stringify(config) === JSON.stringify(expectedConfig);
            let bodyMatches = JSON.stringify(data) === JSON.stringify(expectedBody);
            if (urlMatches && bodyMatches && headersMatch) {
                return expectedresponse;
            }
            return null;
        });

        const actual = await SpaceClient.editSpace('uuidbob', expectedSpace);

        expect(actual).toBe(expectedresponse);
    });

    it('should invite users to a space', function() {
        Axios.put = jest.fn();

        const cookies = new Cookies();
        cookies.set('accessToken', '123456');

        SpaceClient.inviteUsersToSpace('spaceUUID', ['email1@mail.com', 'email2@mail.com']);

        const expectedUrl = '/api/user/invite/space';
        const expectedData = {
            uuid: 'spaceUUID',
            emails: ['email1@mail.com', 'email2@mail.com'],
        };
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 123456',
            },
        };

        expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
    });

    it('todo', function() {
        //TODO make space client tests use .then() like product client test
        fail();
    });
});
