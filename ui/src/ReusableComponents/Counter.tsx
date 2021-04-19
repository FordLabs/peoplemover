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
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterConstants';
import {isActiveProduct, isProductMatchingSelectedFilters, Product} from '../Products/Product';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';
import './Counter.scss';

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

    let filteredProducts: Array<Product> = [];
    let unassignedProduct: Product;

    const filterProductsAndFindUnassignedProduct = (): void => {
        let locationFilter = getSelectedFilterLabels(props.allGroupedTagFilterOptions[0].options);
        let productTagFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[1].options);

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
        let peopleCount = new Set<number>();
        let unassignedPeopleCount = new Set<number>();

        unassignedPeopleCount = getCountOfAssignmentForAProductBasedOnRoleFilter(unassignedProduct);
        productAndPeopleCount.unassignedPeopleCount = unassignedPeopleCount.size;

        filteredProducts.forEach(product => {
            let productPeopleCount = getCountOfAssignmentForAProductBasedOnRoleFilter(product);
            productPeopleCount.forEach(entry => {
                peopleCount.add(entry);
            });
        });

        productAndPeopleCount.assignedPeopleCount = peopleCount.size;
        productAndPeopleCount.totalPeopleCount = peopleCount.size + unassignedPeopleCount.size;
    };

    const getCountOfAssignmentForAProductBasedOnRoleFilter = (product: Product): Set<number> => {
        let selectedRoleFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[2].options);
        let peopleCount = new Set<number>();

        product.assignments.forEach(assignment => {
            if (selectedRoleFilters.length > 0) {
                if (assignment.person.spaceRole && selectedRoleFilters.includes(assignment.person.spaceRole.name)) {
                    peopleCount.add(assignment.person.id);
                }
            } else {
                peopleCount.add(assignment.person.id);
            }
        });

        return peopleCount;
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
