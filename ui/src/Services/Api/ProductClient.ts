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

import Axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import { Space } from 'Types/Space';
import { Product } from 'Types/Product';
import { getAxiosConfig } from 'Utils/getAxiosConfig';

function getBaseProductsUrl(spaceUuid: string): string {
    return '/api/spaces/' + spaceUuid + '/products';
}

async function createProduct(
    space: Space,
    product: Product
): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '');
    return Axios.post(url, product, getAxiosConfig());
}

async function editProduct(
    space: Space,
    product: Product
): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '') + `/${product.id}`;
    return Axios.put(url, product, getAxiosConfig());
}

async function deleteProduct(
    space: Space,
    product: Product
): Promise<AxiosResponse> {
    const url = getBaseProductsUrl(space.uuid || '') + `/${product.id}`;
    return Axios.delete(url, getAxiosConfig());
}

async function getProductsForDate(
    spaceUuid: string,
    date: Date
): Promise<AxiosResponse> {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const url =
        getBaseProductsUrl(spaceUuid) + `?requestedDate=${formattedDate}`;
    return Axios.get(url, getAxiosConfig());
}

const ProductClient = {
    createProduct,
    editProduct,
    deleteProduct,
    getProductsForDate,
};

export default ProductClient;
