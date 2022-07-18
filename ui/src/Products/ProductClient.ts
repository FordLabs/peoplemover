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
import {Product} from './Product';
import moment from 'moment';
import {getToken} from '../Auth/TokenProvider';
import MatomoEvents from '../Matomo/MatomoEvents';
import {Space} from 'Types/Space';

class ProductClient {
    private static getBaseProductsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/products';
    }

    static async createProduct(space: Space, product: Product): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseProductsUrl(space.uuid!);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, product, config).then(result => {
            MatomoEvents.pushEvent(space.name, 'createProduct', product.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'createProductError', product.name, err.code);
            return Promise.reject(err);
        });
    }

    static async editProduct(space: Space, product: Product, isArchive = false): Promise<AxiosResponse> {
        const url = this.getBaseProductsUrl(space.uuid!) + `/${product.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, product, config).then(result => {
            if (isArchive) {
                MatomoEvents.pushEvent(space.name, 'archiveProduct', product.name);
            } else {
                MatomoEvents.pushEvent(space.name, 'editProduct', product.name);
            }
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent(space.name, 'editProductError', product.name, err.code);
            return Promise.reject(err);
        });
    }

    static async deleteProduct(space: Space, product: Product): Promise<AxiosResponse> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const url = this.getBaseProductsUrl(space.uuid!) + `/${product.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config).then(result => {
            MatomoEvents.pushEvent(space.name, 'deleteProduct', product.name);
            return result;
        }).catch((error) => {
            MatomoEvents.pushEvent(space.name, 'deleteProductError', product.name, error.code);
            return Promise.reject(error);
        });
    }

    static async getProductsForDate(spaceUuid: string, date: Date): Promise<AxiosResponse> {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        const url = this.getBaseProductsUrl(spaceUuid) + `?requestedDate=${formattedDate}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.get(url, config);
    }
}

export default ProductClient;
