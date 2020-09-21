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

class ProductTagClient implements TraitClient {
    private getBaseProductTagsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/product-tags';
    }

    async get(spaceUuid: string): Promise<AxiosResponse<Array<ProductTag>>> {
        const url = this.getBaseProductTagsUrl(spaceUuid);
        const config = {headers: {'Content-Type': 'application/json'}};
        return Axios.get(url, config);
    }

    async add(productTagAddRequest: TraitAddRequest, spaceUuid: string ): Promise<AxiosResponse> {
        const url = this.getBaseProductTagsUrl(spaceUuid);
        return Axios.post(url, productTagAddRequest);
    }

    async edit(productTagEditRequest: TraitEditRequest, spaceUuid: string): Promise<AxiosResponse<ProductTag>> {
        const url = this.getBaseProductTagsUrl(spaceUuid);
        return Axios.put(url, productTagEditRequest);
    }

    async delete(productTagId: number, spaceUuid: string): Promise<AxiosResponse> {
        const url = this.getBaseProductTagsUrl(spaceUuid) + `/${productTagId}`;
        return Axios.delete(url);
    }
}
export default new ProductTagClient();
