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
import {Tag} from '../Tags/Tag';
import {TagRequest} from '../Tags/TagRequest.interface';
import {TagClient} from '../Tags/TagClient.interface';
import {getToken} from '../Auth/TokenProvider';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';

class ProductTagClient implements TagClient {
    private getBaseProductTagsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/product-tags';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<Array<Tag>>> {
        const url = this.getBaseProductTagsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(productTagAddRequest: TagRequest, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseProductTagsUrl(space.uuid!!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, productTagAddRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'addProductTag', productTagAddRequest.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'addProductTagError', productTagAddRequest.name, err.code);
            return Promise.reject(err.code);
        });
    }

    async edit(productTagEditRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = `${this.getBaseProductTagsUrl(space.uuid!!)}/${productTagEditRequest.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, productTagEditRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'editProductTag', productTagEditRequest.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'editProductTagError', productTagEditRequest.name, err.code);
            return Promise.reject(err.code);
        });
    }

    async delete(productTagId: number, space: Space): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseProductTagsUrl(space.uuid!!) + `/${productTagId}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'deleteProductTag', productTagId.toString());
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'deleteProductTagError', productTagId.toString(), err.code);
            return Promise.reject(err.code);
        });
    }
}
export default new ProductTagClient();
