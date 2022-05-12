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

import React from 'react';
import {AllGroupedTagFilterOptions, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import {
    isActiveProduct,
    isProductMatchingSelectedFilters,
    Product,
    stripAssignmentsForArchivedPeople,
} from '../Products/Product';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';
import './Counter.scss';
import {isPersonMatchingSelectedFilters} from '../People/Person';

interface CounterProps {
    products: Array<Product>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
}

interface ProductAndPeopleCount {
    unassignedPeopleCount: number;
    assignedPeopleCount: number;
    totalPeopleCount: number;
    productCount: number;
}

function Counter(props: CounterProps): JSX.Element {
    const productAndPeopleCount: ProductAndPeopleCount = {
        unassignedPeopleCount: 0,
        assignedPeopleCount: 0,
        totalPeopleCount: 0,
        productCount: 0,
    };

    const filteredProducts: Array<Product> = [];
    let unassignedProduct: Product;

    const filterProductsAndFindUnassignedProduct = (): void => {
        const locationFilter = getSelectedFilterLabels(props.allGroupedTagFilterOptions[FilterTypeListings.Location.index].options);
        const productTagFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[FilterTypeListings.ProductTag.index].options);

        props.products.forEach(product => {
            if (product.name === 'unassigned') {
                unassignedProduct = product;
            }
            if (isActiveProduct(product, props.viewingDate) && isProductMatchingSelectedFilters(product, locationFilter, productTagFilters)) {
                filteredProducts.push(product);
            }
        });
    };

    const getProductCount = (): void => {
        productAndPeopleCount.productCount = filteredProducts.length;
    };

    const getPeopleCount = (): void => {
        const peopleSet = new Set<number>();
        let unassignedPeopleSet = new Set<number>();
        const unassignedWithoutArchived = stripAssignmentsForArchivedPeople(unassignedProduct, props.viewingDate);
        unassignedPeopleSet = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(unassignedWithoutArchived);
        productAndPeopleCount.unassignedPeopleCount = unassignedPeopleSet.size;

        filteredProducts.forEach(product => {
            const productPeopleCount = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(product);
            productPeopleCount.forEach(entry => {
                peopleSet.add(entry);
            });
        });

        productAndPeopleCount.assignedPeopleCount = peopleSet.size;
        productAndPeopleCount.totalPeopleCount = peopleSet.size + unassignedPeopleSet.size;
    };

    const getSetOfPersonIdsForAProductByRoleAndPersonTagFilters = (product: Product): Set<number> => {
        const selectedRoleFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[FilterTypeListings.Role.index].options);
        const selectedPersonTagFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[FilterTypeListings.PersonTag.index].options);
        const peopleSet = new Set<number>();

        product.assignments.forEach(assignment => {
            if (isPersonMatchingSelectedFilters(assignment.person, selectedRoleFilters, selectedPersonTagFilters)) {
                peopleSet.add(assignment.person.id);
            }
        });

        return peopleSet;
    };

    filterProductsAndFindUnassignedProduct();
    getProductCount();
    getPeopleCount();

    return (
        <div className="counter-container">
            <span className="counter" data-testid="counter">
            Results - Products: {productAndPeopleCount.productCount}, People: {productAndPeopleCount.totalPeopleCount} (Unassigned: {productAndPeopleCount.unassignedPeopleCount})
            </span>
        </div>
    );
}

export default Counter;
