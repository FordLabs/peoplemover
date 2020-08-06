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

class SpaceClient {

    static async getSpacesForUser(accessToken: string): Promise<AxiosResponse<Space[]>> {
        return Axios.get(`/api/user/space`, {headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        }});
    }

    static async getSpaceFromName(spaceName: string): Promise<AxiosResponse<Space>> {
        return Axios.get(`/api/space/${spaceName}`, {headers: {
            'Content-Type': 'application/json',
        }});
    }

    static async createSpaceForUser(spaceName: string, accessToken: string): Promise<AxiosResponse<SpaceWithAccessTokenResponse>> {
        return Axios.post(
            `/api/user/space`,
            {
                spaceName: spaceName,
            },
            {headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            }}
        );
    }

    static async inviteUsersToSpace(spaceName: string, emails: string[]): Promise<AxiosResponse<void>> {
        return Axios.put(
            `/api/user/invite/space`,
            {
                spaceName: spaceName,
                emails: emails,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
}

export default SpaceClient;
