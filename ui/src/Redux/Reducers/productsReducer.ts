/*
 *
 *  * Copyright (c) 2019 Ford Motor Company
 *  * All rights reserved.
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  * http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

import {AvailableActions} from '../Actions';
import {Product} from '../../Products/Product';

const productsReducer = (state: Array<Product> = [], action: {type: AvailableActions; products: Array<Product>; sortOption: string} ): Array<Product> => {
    if (action.type === AvailableActions.SET_PRODUCTS) {
        switch(action.sortOption) {
            case('location'): return [...action.products].sort(sortByLocation);
            case('name'): return [...action.products].sort(sortByProductName);
            default: return [...action.products];
        }
    } else {
        return state;
    }
};

export function sortByProductName(productAName: Product, productBName: Product): number {
    return productAName.name.toLowerCase().localeCompare(productBName.name.toLowerCase());
}

function sortByLocation(productA: Product, productB: Product) {
    const locationA = getSpaceLocationNameSafely(productA);
    const locationB = getSpaceLocationNameSafely(productB);

    const comparisonValue: number = locationA.toLowerCase().localeCompare(locationB.toLowerCase());
    if (comparisonValue === 0) {
        return sortByProductName(productA, productB);
    }
    return comparisonValue;
}

function getSpaceLocationNameSafely(product: Product): string {
    return product.spaceLocation ? product.spaceLocation.name : 'ZZZZZZZZ';
}

export default productsReducer;
