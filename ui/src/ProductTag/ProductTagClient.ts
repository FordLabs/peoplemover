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
import {ProductTag} from './ProductTag';
import {TraitAddRequest} from '../Traits/TraitAddRequest';
import {TraitEditRequest} from '../Traits/TraitEditRequest';
import {TraitClient} from '../Traits/TraitClient';
import {getToken} from '../Auth/TokenProvider';
import {Trait} from "../Traits/Trait";
import {Space} from "../Space/Space";
import MatomoEvents from "../Matomo/MatomoEvents";

class ProductTagClient implements TraitClient {
    private getBaseProductTagsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/product-tags';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<Array<ProductTag>>> {
        const url = this.getBaseProductTagsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }

    async add(addRequest: TraitAddRequest, space: Space): Promise<AxiosResponse<Trait>> {
        const url = this.getBaseProductTagsUrl(space.uuid!!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, addRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'addProductTag', addRequest.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'addProductTagError', addRequest.name, err.code);
            return Promise.reject(err.code);
        });
    }

    async edit(editRequest: TraitEditRequest, space: Space): Promise<AxiosResponse<Trait>> {
        const url = this.getBaseProductTagsUrl(space.uuid!!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, editRequest, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'editProductTag', editRequest.updatedName!!);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'editProductTagError', editRequest.updatedName!!, err.code);
            return Promise.reject(err.code);
        });
    }

    async delete(trait: Trait, space: Space): Promise<AxiosResponse> {
        const url = this.getBaseProductTagsUrl(space.uuid!!) + `/${trait.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then( result => {
            MatomoEvents.pushEvent(space.name, 'deleteProductTag', trait.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'deleteProductTagError', trait.name, err.code);
            return Promise.reject(err.code);
        });
    }
}
export default new ProductTagClient();
