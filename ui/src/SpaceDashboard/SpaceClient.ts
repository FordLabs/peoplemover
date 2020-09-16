/*
 * Copyright (c) 2019 Ford Motor Company
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
import {Space} from './Space';
import {SpaceWithAccessTokenResponse} from './SpaceWithAccessTokenResponse';
import {getToken} from '../Auth/TokenProvider';

class SpaceClient {

    static async getSpacesForUser(): Promise<AxiosResponse<Space[]>> {
        return Axios.get(`/api/user/space`, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        }});
    }

    static async getSpaceFromUuid(spaceUuid: string): Promise<AxiosResponse<Space>> {
        return Axios.get(`/api/space/${spaceUuid}`, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        }});
    }

    static async createSpaceForUser(spaceName: string): Promise<AxiosResponse<SpaceWithAccessTokenResponse>> {
        return Axios.post(
            `/api/user/space`,
            {
                spaceName: spaceName,
            },
            {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            }}
        );
    }

    static async editSpace(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
        return Axios.put(`/api/space/${uuid}`,
            {editedSpace},
            {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            }}
        );
    }
    static async inviteUsersToSpace(spaceUuid: string, emails: string[]): Promise<AxiosResponse<void>> {
        return Axios.put(
            `/api/user/invite/space`,
            {
                uuid: spaceUuid,
                emails: emails,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
            }
        );
    }
}

export default SpaceClient;
