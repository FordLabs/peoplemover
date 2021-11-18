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
import {Space} from './Space';
import {SpaceWithAccessTokenResponse} from './SpaceWithAccessTokenResponse';
import {getToken} from '../Auth/TokenProvider';
import {UserSpaceMapping} from './UserSpaceMapping';
import MatomoEvents from '../Matomo/MatomoEvents';

const baseSpaceUrl = `/api/spaces`;

class SpaceClient {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    static getConfig(withJson = true): any {
        if (withJson)
            return {headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
            }};
        else return {headers: {
            'Authorization': `Bearer ${getToken()}`}};
    }

    static async deleteSpaceByUuid(uuid: string): Promise<void> {
        const url = `${baseSpaceUrl}/${uuid}`;
        return Axios.delete(url, SpaceClient.getConfig(false));

    }

    static async getSpacesForUser(): Promise<AxiosResponse<Space[]>> {
        const url = baseSpaceUrl + '/user';

        return Axios.get(url, SpaceClient.getConfig());
    }

    static async getSpaceFromUuid(spaceUuid: string): Promise<AxiosResponse<Space>> {
        const url = `${baseSpaceUrl}/${spaceUuid}`;

        return Axios.get(url, SpaceClient.getConfig());
    }

    static compareByPermissionThenByUserId = (a: UserSpaceMapping, b: UserSpaceMapping): number => {
        let comparison = 0;
        if (a.permission === b.permission) {
            if (a.userId > b.userId) comparison = 1;
            else if (a.userId < b.userId) comparison = -1;
        } else {
            if (a.permission.toLowerCase() === 'owner') comparison = -1;
            else if (b.permission.toLowerCase() === 'owner') comparison = 1;
        }
        return comparison;
    }

    static async getUsersForSpace(spaceUuid: string): Promise<UserSpaceMapping[]> {
        const url = `${baseSpaceUrl}/${spaceUuid}/users`;


        return Axios.get(url, SpaceClient.getConfig()).then((users) => {
            return users.data.sort(SpaceClient.compareByPermissionThenByUserId);
        });
    }

    static async createSpaceForUser(spaceName: string): Promise<AxiosResponse<SpaceWithAccessTokenResponse>> {
        const url = `${baseSpaceUrl}/user`;
        const data = { spaceName };


        return Axios.post(url, data, SpaceClient.getConfig());
    }

    static async editSpaceName(uuid: string, editedSpace: Space, oldSpaceName: string): Promise<AxiosResponse> {
        return this.editSpace(uuid, editedSpace).then(result => {
            MatomoEvents.pushEvent(oldSpaceName, 'editSpaceName', editedSpace.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(oldSpaceName, 'editSpaceNameError', editedSpace.name, err.code);
            return Promise.reject(err);
        });
    }

    static async editSpaceReadOnlyFlag(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
        return this.editSpace(uuid, editedSpace).then(result => {
            MatomoEvents.pushEvent(editedSpace.name, 'editSpaceReadOnlyFlag', `${editedSpace.todayViewIsPublic}`);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(editedSpace.name, 'editSpaceReadOnlyFlagError', err.code);
            return Promise.reject(err);
        });
    }

    private static async editSpace(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
        const url = `${baseSpaceUrl}/${uuid}`;
        const data = editedSpace;


        return Axios.put(url, data, SpaceClient.getConfig());
    }

    static async inviteUsersToSpace(space: Space, userIds: string[]): Promise<AxiosResponse<void>> {
        const url = `${baseSpaceUrl}/${space.uuid}/users`;
        const data = { userIds };

        return Axios.post(url, data, SpaceClient.getConfig()).then((result) => {
            MatomoEvents.pushEvent(space.name, 'inviteUser', userIds.join(', '));
            return result;
        }).catch((error) => {
            MatomoEvents.pushEvent(space.name, 'inviteUserError', userIds.join(', '), error.code);
            return Promise.reject(error);
        });
    }

    static removeUser(space: Space, user: UserSpaceMapping): Promise<AxiosResponse<void>> {
        const url = `${baseSpaceUrl}/${space.uuid}/users/${user.userId}`;
        return Axios.delete(url, SpaceClient.getConfig(false)).then((result) => {
            MatomoEvents.pushEvent(space.name, 'removeUser', user.userId);
            return result;
        }).catch((error) => {
            MatomoEvents.pushEvent(space.name, 'removeUserError', user.userId, error.code);
            return Promise.reject(error);
        });
    }

    static async changeOwner(space: Space, currentOwner: UserSpaceMapping, newOwner: UserSpaceMapping): Promise<AxiosResponse<void>> {
        const url = `${baseSpaceUrl}/${space.uuid}/users/${newOwner.userId}`;

        return Axios.put(url, null, this.getConfig(false)).then((result) => {
            MatomoEvents.pushEvent(space.name, 'updateOwner', `oldOwner: ${currentOwner.userId} -> newOwner: ${newOwner.userId}`);
            return result;
        }).catch((error) => {
            MatomoEvents.pushEvent(space.name, 'updateOwnerError', `oldOwner: ${currentOwner.userId} -> newOwner: ${newOwner.userId}`, error.code);
            return Promise.reject(error);
        });
    }
}

export default SpaceClient;
