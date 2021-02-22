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
import SpaceClient from './SpaceClient';
import Cookies from 'universal-cookie';
import {createEmptySpace} from './Space';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import TestUtils from '../tests/TestUtils';
import {UserSpaceMapping} from './UserSpaceMapping';

declare let window: MatomoWindow;

describe('Space Client', function() {
    const baseSpaceUrl = `/api/spaces`;
    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    let originalWindow: Window;

    beforeEach(function() {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.delete = jest.fn( x => Promise.resolve({} as AxiosResponse));
        originalWindow = window;
        window._paq = [];
    });

    afterEach(function() {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should return the space given a user', function(done) {
        const url = baseSpaceUrl + '/user';
        SpaceClient.getSpacesForUser().then(() => {
            expect(Axios.get).toHaveBeenCalledWith(url, expectedConfig);
            done();
        });
    });

    it('should return the space given a space name', function(done) {
        const expectedUrl = baseSpaceUrl + '/testName';
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

    it('should edit space name given space uuid and content', function(done) {
        const expectedUrl = baseSpaceUrl + '/uuidbob';
        const expectedBody = createEmptySpace();
        expectedBody.name = 'NewName';

        const oldSpaceName = 'OldName';

        SpaceClient.editSpaceName('uuidbob', expectedBody, oldSpaceName).then(() => {
            expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedBody, expectedConfig);
            expect(window._paq).toContainEqual(['trackEvent', oldSpaceName, 'editSpaceName', expectedBody.name]);
            done();
        });
    });

    it('should edit space read-only flag given space uuid and content', function(done) {
        const expectedUrl = baseSpaceUrl + '/uuidbob';
        const expectedBody = createEmptySpace();
        expectedBody.todayViewIsPublic = true;

        SpaceClient.editSpaceReadOnlyFlag('uuidbob', expectedBody).then(() => {
            expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedBody, expectedConfig);
            expect(window._paq).toContainEqual(['trackEvent', expectedBody.name, 'editSpaceReadOnlyFlag', `${expectedBody.todayViewIsPublic}`]);
            done();
        });
    });

    it('should get all the users for a space', function(done) {
        const expectedUrl = baseSpaceUrl + '/uuidbob/users';

        SpaceClient.getUsersForSpace('uuidbob').then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });

    it('should invite users to a space and send event to matomo', function(done) {
        const expectedUrl = `/api/spaces/${TestUtils.space.uuid}:invite`;
        const expectedData = {
            emails: ['email1@mail.com', 'email2@mail.com'],
        };

        SpaceClient.inviteUsersToSpace(TestUtils.space, ['email1@mail.com', 'email2@mail.com'])
            .then(() => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'inviteUser', expectedData.emails.join(', ')]);
                done();
            });
    });

    it('should remove users from space', (done) => {
        const user: UserSpaceMapping = {id: 'blah', userId: 'user1', spaceUuid: `${TestUtils.space.uuid}`, permission: 'fakePermission'};
        SpaceClient.removeUser(TestUtils.space, user)
            .then(() => {
                expect(Axios.delete).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/user/${user.userId}`,
                    {headers: {Authorization: 'Bearer 123456'}}
                );
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'removeUser', user.userId]);
                done();
            });
    });
});
