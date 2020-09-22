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

import Axios from 'axios';
import SpaceClient from '../SpaceDashboard/SpaceClient';

describe('Space Client', function() {
    it('should invite users to a space', function() {
        Axios.put = jest.fn();
        const uuid = 'spaceUUID';

        SpaceClient.inviteUsersToSpace(uuid, ['email1@mail.com', 'email2@mail.com']);

        const expectedUrl = `/api/spaces/${uuid}:invite`;
        const expectedData = {
            emails: ['email1@mail.com', 'email2@mail.com'],
        };
        const expectedConfig = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedData, expectedConfig);
    });

    it('should return the space given a space name', function() {
        Axios.get = jest.fn();

        const expectedUrl = '/api/spaces/testName';
        const expectedConfig = {
            headers: { 'Content-Type': 'application/json' },
        };

        SpaceClient.getSpaceFromUuid('testName');

        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });
});