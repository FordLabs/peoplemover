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
import {Tag} from 'Types/Tag';
import {TagRequest} from 'Types/TagRequest';
import {TagClient} from 'Types/TagClient';
import {Space} from 'Types/Space';
import MatomoService from 'Services/MatomoService';
import {getAxiosConfig} from 'Utils/getAxiosConfig';

function getBaseProductTagsUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/product-tags';
}

async function get(spaceUuid: string): Promise<AxiosResponse<Array<Tag>>> {
    const url = getBaseProductTagsUrl(spaceUuid);
    return Axios.get(url, getAxiosConfig());
}

async function add(productTagAddRequest: TagRequest, space: Space): Promise<AxiosResponse> {
    const url = getBaseProductTagsUrl(space.uuid!);
    return Axios.post(url, productTagAddRequest, getAxiosConfig()).then( result => {
        MatomoService.pushEvent(space.name, 'addProductTag', productTagAddRequest.name);
        return result;
    }).catch(err => {
        MatomoService.pushEvent(space.name, 'addProductTagError', productTagAddRequest.name, err.code);
        return Promise.reject(err);
    });
}

async function edit(productTagEditRequest: TagRequest, space: Space): Promise<AxiosResponse<Tag>> {
    const url = `${getBaseProductTagsUrl(space.uuid!)}/${productTagEditRequest.id}`;
    return Axios.put(url, productTagEditRequest, getAxiosConfig()).then( result => {
        MatomoService.pushEvent(space.name, 'editProductTag', productTagEditRequest.name);
        return result;
    }).catch(err => {
        MatomoService.pushEvent(space.name, 'editProductTagError', productTagEditRequest.name, err.code);
        return Promise.reject(err);
    });
}

async function deleteProduct(productTagId: number, space: Space): Promise<AxiosResponse> {
    const url = getBaseProductTagsUrl(space.uuid!) + `/${productTagId}`;
    return Axios.delete(url, getAxiosConfig()).then( result => {
        MatomoService.pushEvent(space.name, 'deleteProductTag', productTagId.toString());
        return result;
    }).catch(err => {
        MatomoService.pushEvent(space.name, 'deleteProductTagError', productTagId.toString(), err.code);
        return Promise.reject(err);
    });
}

const ProductTagClient: TagClient = {
    get,
    add,
    edit,
    delete: deleteProduct
}

export default ProductTagClient;