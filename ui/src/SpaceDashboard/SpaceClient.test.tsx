/*
 *
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
 *
 */

import Axios, {AxiosResponse} from 'axios';
import SpaceClient from './SpaceClient';
import Cookies from 'universal-cookie';
import {createEmptySpace} from './Space';

describe('Space Client', function() {
    const baseSpaceUrl = `/api/spaces`;
    const uuid = 'spaceUUID';
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
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should return the space given a user', function(done) {
        const url = baseSpaceUrl + '/user';
        SpaceClient.getSpacesForUser().then(() => {
            expect(Axios.get).toHaveBeenCalledWith(url, expectedConfig);
            done();
        });

    });

    it('should return the space given a space name', function(done) {
        const expectedUrl = baseSpaceUrl +'/testName';
        SpaceClient.getSpaceFromUuid('testName').then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });

    });

    it('should create a space given a space name', function(done) {
        const expectedUrl = baseSpaceUrl + '/user';
        const expectedBody = {spaceName: 'bob'};

        SpaceClient.createSpaceForUser('bob').then(() => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedBody, expectedConfig);
            done();
        });

    });

    it('should edit space given space uuid and content', function(done) {
        const expectedUrl = baseSpaceUrl + '/uuidbob';
        const expectedBody = createEmptySpace();

        SpaceClient.editSpace('uuidbob', createEmptySpace()).then(() => {
            expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedBody, expectedConfig);
            done();
        });
    });

    it('should invite users to a space', function(done) {
        const expectedUrl = `/api/spaces/${uuid}:invite`;
        const expectedData = {
            emails: ['email1@mail.com', 'email2@mail.com'],
        };

        SpaceClient.inviteUsersToSpace('spaceUUID', ['email1@mail.com', 'email2@mail.com'])
            .then(() => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
                done();
            });
    });
});
