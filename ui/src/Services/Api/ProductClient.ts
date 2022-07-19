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
import moment from 'moment';
import {getToken} from 'Services/TokenService';
import MatomoService from 'Services/MatomoService';
import {Space} from 'Types/Space';
import {Product} from 'Types/Product';
import {getAxiosConfig} from 'Utils/getAxiosConfig';

function getBaseProductsUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/products';
}

async function createProduct(space: Space, product: Product): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '');
    return Axios.post(url, product, getAxiosConfig()).then(result => {
        MatomoService.pushEvent(space.name, 'createProduct', product.name);
        return result;
    }).catch(err => {
        MatomoService.pushEvent(space.name, 'createProductError', product.name, err.code);
        return Promise.reject(err);
    });
}

async function editProduct(space: Space, product: Product, isArchive = false): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '') + `/${product.id}`;
    return Axios.put(url, product, getAxiosConfig()).then(result => {
        if (isArchive) {
            MatomoService.pushEvent(space.name, 'archiveProduct', product.name);
        } else {
            MatomoService.pushEvent(space.name, 'editProduct', product.name);
        }
        return result;
    }).catch(err => {
        MatomoService.pushEvent(space.name, 'editProductError', product.name, err.code);
        return Promise.reject(err);
    });
}

async function deleteProduct(space: Space, product: Product): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '') + `/${product.id}`;
    return Axios.delete(url, getAxiosConfig()).then(result => {
        MatomoService.pushEvent(space.name, 'deleteProduct', product.name);
        return result;
    }).catch((error) => {
        MatomoService.pushEvent(space.name, 'deleteProductError', product.name, error.code);
        return Promise.reject(error);
    });
}

async function getProductsForDate(spaceUuid: string, date: Date): Promise<AxiosResponse> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const url = getBaseProductsUrl(spaceUuid) + `?requestedDate=${formattedDate}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
        },
    };

    return Axios.get(url, config);
}

const ProductClient = {
    createProduct,
    editProduct,
    deleteProduct,
    getProductsForDate
}

export default ProductClient;