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
import {Location} from './Location.interface';
import {TagRequest} from '../Tags/TagRequest.interface';
import {TagClient} from '../Tags/TagClient.interface';
import {getToken} from '../Auth/TokenProvider';

class LocationClient implements TagClient {
    private getBaseLocationsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/locations';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<Location[]>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(location: TagRequest, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, location, config);
    }

    async edit(location: TagRequest, spaceUuid: string): Promise<AxiosResponse<Location>> {
        const url = this.getBaseLocationsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, location, config);
    }

    async delete(locationId: number, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseLocationsUrl(spaceUuid) + `/${locationId}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config);
    }
}

export default new LocationClient();
