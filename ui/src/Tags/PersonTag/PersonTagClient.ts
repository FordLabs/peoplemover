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
import {Tag} from 'Types/Tags';
import {TagRequest} from '../../Types/TagRequest';
import {TagClient} from '../../Types/TagClient';
import {getToken} from '../../Auth/TokenProvider';
import {Space} from 'Types/Space';
import MatomoEvents from '../../Matomo/MatomoEvents';

class PersonTagClient implements TagClient {
    private getBasePersonTagsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/person-tags';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<Array<Tag>>> {
        const url = this.getBasePersonTagsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(personTagAddRequest: TagRequest, space: Space): Promise<AxiosResponse> {
        const url = this.getBasePersonTagsUrl(space.uuid!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, personTagAddRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'addPersonTag', personTagAddRequest.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'addPersonTagError', personTagAddRequest.name, err.code);
            return Promise.reject(err);
        });
    }

    async edit(personTagEditRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>> {
        const url = `${this.getBasePersonTagsUrl(space.uuid!)}/${personTagEditRequest.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, personTagEditRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'editPersonTag', personTagEditRequest.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'editPersonTagError', personTagEditRequest.name, err.code);
            return Promise.reject(err);
        });
    }

    async delete(personTagId: number, space: Space): Promise<AxiosResponse> {
        const url = this.getBasePersonTagsUrl(space.uuid!) + `/${personTagId}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'deletePersonTag', personTagId.toString());
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'deletePersonTagError', personTagId.toString(), err.code);
            return Promise.reject(err);
        });
    }
}
export default new PersonTagClient();
