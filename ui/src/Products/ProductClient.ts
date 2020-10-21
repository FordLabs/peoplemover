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
import {Product} from './Product';
import moment from 'moment';
import {getToken} from '../Auth/TokenProvider';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import MatomoEvents from '../Matomo/MatomoEvents';

declare let window: MatomoWindow;

class ProductClient {
    private static getBaseProductsUrl(spaceUuid: string): string {
        return '/api/spaces/' + spaceUuid + '/products';
    }

    static async createProduct(spaceUuid: string, product: Product): Promise<AxiosResponse> {
        const url = this.getBaseProductsUrl(spaceUuid);
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.post(url, product, config).then(result => {
            MatomoEvents.pushEvent('Product', 'create', product.name);
            return result;
        }).catch(err => {
            MatomoEvents.pushEvent('Product', 'createError', product.name, err.code);
            return Promise.reject(err);
        });
    }

    static async editProduct(spaceUuid: string, product: Product): Promise<AxiosResponse> {
        const url = this.getBaseProductsUrl(spaceUuid) + `/${product.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.put(url, product, config);
    }

    static async deleteProduct(spaceUuid: string, product: Product): Promise<AxiosResponse> {
        const url = this.getBaseProductsUrl(spaceUuid) + `/${product.id}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };

        return Axios.delete(url, config);
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
