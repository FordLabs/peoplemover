/*
 * Copyright (c) 2021 Ford Motor Company
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

import {isActiveProduct, isProductMatchingSelectedFilters, Product} from '../Products/Product';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';
import {AllGroupedTagFilterOptions, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import {isPersonMatchingSelectedFilters} from '../People/Person';

export interface CounterInterface {
    unassignedPeopleCount: number;
    assignedPeopleCount: number;
    totalPeopleCount: number;
    productCount: number;
}

export const getFilteredCounter = (products: Array<Product>, viewingDate: Date, allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): CounterInterface => {
    const filteredCounter: CounterInterface = {
        unassignedPeopleCount: 0,
        assignedPeopleCount: 0,
        totalPeopleCount: 0,
        productCount: 0,
    };

    let filteredProducts: Array<Product> = [];
    let unassignedProduct: Product;

    const filterProductsAndFindUnassignedProduct = (): void => {
        let locationFilter = getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.Location.index].options);
        let productTagFilters = getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.ProductTag.index].options);

        products.forEach(product => {
            if (product.name === 'unassigned') {
                unassignedProduct = product;
            }
            if (isActiveProduct(product, viewingDate) && isProductMatchingSelectedFilters(product, locationFilter, productTagFilters)) {
                filteredProducts.push(product);
            }
        });
    };

    const updateProductCount = (): void => {
        filteredCounter.productCount = filteredProducts.length;
    };

    const getSetOfPersonIdsForAProductByRoleAndPersonTagFilters = (product: Product): Set<number> => {
        let selectedRoleFilters = getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.Role.index].options);
        let selectedPersonTagFilters = getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.PersonTag.index].options);
        let peopleSet = new Set<number>();

        product.assignments.forEach(assignment => {
            if (isPersonMatchingSelectedFilters(assignment.person, selectedRoleFilters, selectedPersonTagFilters)) {
                peopleSet.add(assignment.person.id);
            }
        });

        return peopleSet;
    };

    const updatePeopleCount = (): void => {
        let peopleSet = new Set<number>();

        let unassignedPeopleSet = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(unassignedProduct);
        filteredCounter.unassignedPeopleCount = unassignedPeopleSet.size;

        filteredProducts.forEach(product => {
            let productPeopleCount = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(product);
            productPeopleCount.forEach(entry => {
                peopleSet.add(entry);
            });
        });

        filteredCounter.assignedPeopleCount = peopleSet.size;
        filteredCounter.totalPeopleCount = peopleSet.size + unassignedPeopleSet.size;
    };

    filterProductsAndFindUnassignedProduct();
    updateProductCount();
    updatePeopleCount();

    return filteredCounter;
};

