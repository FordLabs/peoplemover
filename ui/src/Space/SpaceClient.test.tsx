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
        /* eslint-disable @typescript-eslint/no-explicit-any */
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse)) as any;
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse)) as any;
        Axios.get = jest.fn(x => Promise.resolve({} as AxiosResponse)) as any;
        Axios.delete = jest.fn( x => Promise.resolve({} as AxiosResponse)) as any;
        /* eslint-enable */
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

    it('should get all the users for a space with the owner first', function(done) {
        const expectedUrl = baseSpaceUrl + '/uuidbob/users';

        // @ts-ignore
        Axios.get = jest.fn(() => Promise.resolve({
            data: [{'userId': 'user_id_2', 'permission': 'editor'}, {'userId': 'user_id', 'permission': 'owner'}],
        } as AxiosResponse));

        SpaceClient.getUsersForSpace('uuidbob').then((users) => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            expect(users).toEqual([{'userId': 'user_id', 'permission': 'owner'}, {'userId': 'user_id_2', 'permission': 'editor'}]);
            done();
        });
    });

    it('should invite users to a space and send event to matomo', function(done) {
        const expectedUrl = `/api/spaces/${TestUtils.space.uuid}/users`;
        const expectedData = {
            userIds: ['cdsid1', 'cdsid2'],
        };

        SpaceClient.inviteUsersToSpace(TestUtils.space, expectedData.userIds)
            .then(() => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'inviteUser', expectedData.userIds.join(', ')]);
                done();
            });
    });

    it('should remove users from space', (done) => {
        const user: UserSpaceMapping = {id: 'blah', userId: 'user1', spaceUuid: `${TestUtils.space.uuid}`, permission: 'fakePermission'};
        SpaceClient.removeUser(TestUtils.space, user)
            .then(() => {
                expect(Axios.delete).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users/${user.userId}`,
                    {headers: {Authorization: 'Bearer 123456'}}
                );
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'removeUser', user.userId]);
                done();
            });
    });

    it('should assign owner permission to specified user from space', (done) => {
        const newOwner: UserSpaceMapping = {id: 'blah', userId: 'newOwner', spaceUuid: `${TestUtils.space.uuid}`, permission: 'editor'};
        const currentOwner: UserSpaceMapping = {id: 'blah', userId: 'currentOwner', spaceUuid: `${TestUtils.space.uuid}`, permission: 'owner'};
        SpaceClient.changeOwner(TestUtils.space, currentOwner, newOwner)
            .then(() => {
                expect(Axios.put).toHaveBeenCalledWith(
                    `/api/spaces/${TestUtils.space.uuid}/users/${newOwner.userId}`,
                    null,
                    {headers: {Authorization: 'Bearer 123456'}}
                );
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'updateOwner', `oldOwner: ${currentOwner.userId} -> newOwner: ${newOwner.userId}`]);
                done();
            });
    });
});
