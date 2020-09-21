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
import {Space} from './Space';
import {SpaceWithAccessTokenResponse} from './SpaceWithAccessTokenResponse';
import {getToken} from '../Auth/TokenProvider';

const baseSpaceUrl = `/api/spaces`;

class SpaceClient {
    static async getSpacesForUser(): Promise<AxiosResponse<Space[]>> {
        const url = baseSpaceUrl;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    static async getSpaceFromUuid(spaceUuid: string): Promise<AxiosResponse<Space>> {
        const url = `${baseSpaceUrl}/${spaceUuid}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    static async createSpaceForUser(spaceName: string): Promise<AxiosResponse<SpaceWithAccessTokenResponse>> {
        const url = `${baseSpaceUrl}/user`;
        const data = { spaceName };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, data, config);
    }

    static async editSpace(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
        const url = `${baseSpaceUrl}/${uuid}`;
        const data = editedSpace;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, data, config);
    }

    static async inviteUsersToSpace(spaceUuid: string, emails: string[]): Promise<AxiosResponse<void>> {
        const url = `${baseSpaceUrl}/${spaceUuid}:invite`;
        const data = { emails };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.put(url, data, config);
    }
}

export default SpaceClient;
