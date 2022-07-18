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

import moment from 'moment';
import {isArchived} from 'People/Person';
import {Product} from 'Types/Product';

export const UNASSIGNED_PRODUCT_NAME = 'unassigned';

export function emptyProduct(spaceUuid?: string): Product {
    return {
        id: -1,
        name: '',
        spaceUuid: spaceUuid ? spaceUuid : 'z',
        startDate: '',
        endDate: '',
        dorf: '',
        tags: [],
        archived: false,
        notes: '',
        url: '',
        assignments: [],
    };
}

export const unassignedProductName = 'unassigned';

export function isUnassignedProduct(product: Product): boolean {
    return product.name === unassignedProductName;
}

export function isArchivedOnDate(product: Product, viewingDate: Date): boolean {
    return product.archived
    || !endsOnOrAfterDate(product, viewingDate);
}

export function isActiveProduct(product: Product, viewingDate: Date): boolean {
    return product.name.toLowerCase() !== unassignedProductName
        && !product.archived
        && endsOnOrAfterDate(product, viewingDate);
}

export function endsOnOrAfterDate(product: Product, date: Date): boolean {
    return product.endDate == null || product.endDate >= moment(date).format('YYYY-MM-DD');
}

export function stripAssignmentsForArchivedPeople(product: Product, viewingDate: Date): Product {
    return {...product, assignments: product?.assignments?.filter(assignment => !isArchived(assignment.person, viewingDate))};
}

export  function isProductMatchingSelectedFilters(product: Product, locationTagFilters: Array<string>, productTagFilters: Array<string>): boolean {
    let isMatchingLocationFilter = false;
    let isMatchingProductTagFilter = false;

    if ((product.spaceLocation && locationTagFilters.includes(product.spaceLocation.name))
        || locationTagFilters.length === 0) {
        isMatchingLocationFilter = true;
    }

    if (product.tags) {
        const productTagNames: Array<string> = product.tags.map(tag => tag.name);
        productTagFilters.forEach(productTagFilter => {
            if (productTagNames.includes(productTagFilter)) {
                isMatchingProductTagFilter = true;
            }
        });
    }
    if (productTagFilters.length === 0) {
        isMatchingProductTagFilter = true;
    }
    return isMatchingProductTagFilter && isMatchingLocationFilter;
}
