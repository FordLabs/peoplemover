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
import MatomoEvents from '../Matomo/MatomoEvents';

const baseSpaceUrl = `/api/spaces`;

class SpaceClient {

    static async getSpacesForUser(): Promise<AxiosResponse<Space[]>> {
        const url = baseSpaceUrl + '/user';
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

    static async editSpace(uuid: string, editedSpace: Space, oldSpaceName: string): Promise<AxiosResponse> {
        const url = `${baseSpaceUrl}/${uuid}`;
        const data = editedSpace;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, data, config).then(result => {
            MatomoEvents.pushEvent(oldSpaceName, 'editSpaceName', editedSpace.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(oldSpaceName, 'editSpaceNameError', editedSpace.name, err.code);
            return Promise.reject(err);
        });
    }

    static async inviteUsersToSpace(space: Space, emails: string[]): Promise<AxiosResponse<void>> {
        const url = `${baseSpaceUrl}/${space.uuid}:invite`;
        const data = { emails };
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.put(url, data, config).then((result) => {
            MatomoEvents.pushEvent(space.name, 'inviteUser', emails.join(', '));
            return result;
        }).catch((error) => {
            MatomoEvents.pushEvent(space.name, 'inviteUserError', emails.join(', '), error.code);
            return Promise.reject(error);
        });
    }
}

export default SpaceClient;
