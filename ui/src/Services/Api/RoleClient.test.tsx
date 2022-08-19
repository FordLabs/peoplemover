/*
 * Copyright (c) 2022 Ford Motor Company
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
import RoleClient from './RoleClient';
import TestData from '../../Utils/TestData';
import Cookies from 'universal-cookie';

describe('Role Client', function () {
    const spaceUuid = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    const cookies = new Cookies();
    const baseRolesUrl = `/api/spaces/${spaceUuid}/roles`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 123456',
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');

        Axios.post = jest.fn().mockResolvedValue({ data: 'Created Role' });
        Axios.put = jest.fn().mockResolvedValue({ data: 'Updated Role' });
        Axios.delete = jest.fn().mockResolvedValue({ data: 'Deleted Role' });
        Axios.get = jest.fn().mockResolvedValue({ data: 'Get Roles' });
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should return all roles for space', function (done) {
        RoleClient.get(spaceUuid).then((response) => {
            expect(Axios.get).toHaveBeenCalledWith(
                baseRolesUrl,
                expectedConfig
            );
            expect(response.data).toBe('Get Roles');
            done();
        });
    });

    it('should create a role and send matomo event and return that role', function (done) {
        const expectedRoleAddRequest = { name: TestData.softwareEngineer.name };
        RoleClient.add(expectedRoleAddRequest, TestData.space).then(
            (response) => {
                expect(Axios.post).toHaveBeenCalledWith(
                    baseRolesUrl,
                    expectedRoleAddRequest,
                    expectedConfig
                );
                expect(response.data).toBe('Created Role');
                done();
            }
        );
    });

    it('should edit a role and event and return that role', function (done) {
        const expectedRoleEditRequest = {
            id: TestData.softwareEngineer.id,
            name: TestData.softwareEngineer.name,
        };
        RoleClient.edit(expectedRoleEditRequest, TestData.space).then(
            (response) => {
                expect(Axios.put).toHaveBeenCalledWith(
                    `${baseRolesUrl}/${TestData.softwareEngineer.id}`,
                    expectedRoleEditRequest,
                    expectedConfig
                );
                expect(response.data).toBe('Updated Role');
                done();
            }
        );
    });

    it('should delete a role', function (done) {
        const expectedUrl = `${baseRolesUrl}/${TestData.softwareEngineer.id}`;
        RoleClient.delete(TestData.softwareEngineer.id, TestData.space).then(
            (response) => {
                expect(Axios.delete).toHaveBeenCalledWith(
                    expectedUrl,
                    expectedConfig
                );
                expect(response.data).toBe('Deleted Role');
                done();
            }
        );
    });
});
