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
import {LocationTag} from './LocationTag.interface';
import {TagRequest} from '../Tags/TagRequest.interface';
import {TagClient} from '../Tags/TagClient.interface';
import {getToken} from '../Auth/TokenProvider';
import {Space} from 'Types/Space';
import MatomoEvents from '../Matomo/MatomoEvents';

class LocationClient implements TagClient {
    private getBaseLocationsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/locations';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<LocationTag[]>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(location: TagRequest, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseLocationsUrl(space.uuid!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, location, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'addLocationTag', location.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'addLocationTagError', location.name, err.code);
            return Promise.reject(err);
        });
    }

    async edit(location: TagRequest, space: Space): Promise<AxiosResponse<LocationTag>> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseLocationsUrl(space.uuid!) + `/${location.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, location, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'editLocationTag', location.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'editLocationTagError', location.name, err.code);
            return Promise.reject(err);
        });
    }

    async delete(locationId: number, space: Space): Promise<AxiosResponse> {
        const url = this.getBaseLocationsUrl(space.uuid!) + `/${locationId}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'deleteLocationTag', locationId.toString());
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'deleteLocationTagError', locationId.toString(), err.code);
            return Promise.reject(err);
        });
    }
}

export default new LocationClient();
