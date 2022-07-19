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

import Axios, {AxiosResponse} from 'axios';
import {Space} from 'Types/Space';
import {UserSpaceMapping} from 'Types/UserSpaceMapping';
import MatomoEvents from 'Matomo/MatomoEvents';
import {getAxiosConfig} from '../Utils/getAxiosConfig';

const baseSpaceUrl = `/api/spaces`;

interface SpaceWithAccessTokenResponse {
    space: Space;
    accessToken: string;
}

async function deleteSpaceByUuid(uuid: string): Promise<void> {
    const url = `${baseSpaceUrl}/${uuid}`;
    return Axios.delete(url, getAxiosConfig());
}

async function getSpacesForUser(): Promise<Space[]> {
    const url = baseSpaceUrl + '/user';
    return Axios.get(url, getAxiosConfig()).then(res => res.data);
}

async function getSpaceFromUuid(spaceUuid: string): Promise<AxiosResponse<Space>> {
    const url = `${baseSpaceUrl}/${spaceUuid}`;
    return Axios.get(url, getAxiosConfig());
}

async function getUsersForSpace(spaceUuid: string): Promise<UserSpaceMapping[]> {
    const url = `${baseSpaceUrl}/${spaceUuid}/users`;
    return Axios.get(url, getAxiosConfig()).then((users) => {
        return users.data.sort(compareByPermissionThenByUserId);
    });
}

function compareByPermissionThenByUserId(a: UserSpaceMapping, b: UserSpaceMapping): number {
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

async function createSpaceForUser(spaceName: string): Promise<AxiosResponse<SpaceWithAccessTokenResponse>> {
    const url = `${baseSpaceUrl}/user`;
    return Axios.post(url, { spaceName }, getAxiosConfig());
}

async function editSpaceName(uuid: string, editedSpace: Space, oldSpaceName: string): Promise<AxiosResponse> {
    return editSpace(uuid, editedSpace).then(result => {
        MatomoEvents.pushEvent(oldSpaceName, 'editSpaceName', editedSpace.name);
        return result;
    }).catch(err => {
        MatomoEvents.pushEvent(oldSpaceName, 'editSpaceNameError', editedSpace.name, err.code);
        return Promise.reject(err);
    });
}

async function editSpaceReadOnlyFlag(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
    return editSpace(uuid, editedSpace).then(result => {
        MatomoEvents.pushEvent(editedSpace.name, 'editSpaceReadOnlyFlag', `${editedSpace.todayViewIsPublic}`);
        return result;
    }).catch(err => {
        MatomoEvents.pushEvent(editedSpace.name, 'editSpaceReadOnlyFlagError', err.code);
        return Promise.reject(err);
    });
}

async function editSpace(uuid: string, editedSpace: Space): Promise<AxiosResponse> {
    const url = `${baseSpaceUrl}/${uuid}`;
    return Axios.put(url, editedSpace, getAxiosConfig());
}

async function inviteUsersToSpace(space: Space, userIds: string[]): Promise<AxiosResponse<void>> {
    const url = `${baseSpaceUrl}/${space.uuid}/users`;
    return Axios.post(url, { userIds }, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'inviteUser', userIds.join(', '));
        return result;
    }).catch((error) => {
        MatomoEvents.pushEvent(space.name, 'inviteUserError', userIds.join(', '), error.code);
        return Promise.reject(error);
    });
}

function removeUser(space: Space, user: UserSpaceMapping): Promise<AxiosResponse<void>> {
    const url = `${baseSpaceUrl}/${space.uuid}/users/${user.userId}`;
    return Axios.delete(url, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'removeUser', user.userId);
        return result;
    }).catch((error) => {
        MatomoEvents.pushEvent(space.name, 'removeUserError', user.userId, error.code);
        return Promise.reject(error);
    });
}

async function changeOwner(space: Space, currentOwner: UserSpaceMapping, newOwner: UserSpaceMapping): Promise<AxiosResponse<void>> {
    const url = `${baseSpaceUrl}/${space.uuid}/users/${newOwner.userId}`;
    return Axios.put(url, null, getAxiosConfig()).then((result) => {
        MatomoEvents.pushEvent(space.name, 'updateOwner', `oldOwner: ${currentOwner.userId} -> newOwner: ${newOwner.userId}`);
        return result;
    }).catch((error) => {
        MatomoEvents.pushEvent(space.name, 'updateOwnerError', `oldOwner: ${currentOwner.userId} -> newOwner: ${newOwner.userId}`, error.code);
        return Promise.reject(error);
    });
}

const SpaceClient = {
    deleteSpaceByUuid,
    getSpacesForUser,
    getSpaceFromUuid,
    getUsersForSpace,
    createSpaceForUser,
    editSpaceName,
    editSpaceReadOnlyFlag,
    inviteUsersToSpace,
    removeUser,
    changeOwner
}

export default SpaceClient;