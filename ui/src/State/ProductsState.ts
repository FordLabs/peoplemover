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

import { atom, selector } from 'recoil';
import { Product } from '../Types/Product';

export const ProductsState = atom<Product[]>({
    key: 'ProductsState',
    default: [],
});

export const UnassignedProductSelector = selector<Product>({
    key: 'UnassignedProductSelector',
    get: ({ get }) => {
        const products = get(ProductsState);
        if (!products.length) return {} as Product;
        const unassignedProducts = products.filter(
            (product) => product.name === 'unassigned'
        );
        return unassignedProducts.length === 1
            ? unassignedProducts[0]
            : ({} as Product);
    },
});
