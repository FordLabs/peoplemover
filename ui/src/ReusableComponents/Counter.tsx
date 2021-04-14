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

interface CounterProps {
    products: Array<Product>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
}

function Counter(props: CounterProps): JSX.Element {
    let locationFilter = getSelectedFilterLabels(props.allGroupedTagFilterOptions[0].options);
    let productTagFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[1].options);

    const productCount = (): number => {
        let counter = 0;
        props.products.forEach(product => {
            if (isActiveProduct(product, props.viewingDate) && isProductMatchingSelectedFilters(product, locationFilter, productTagFilters)) {
                counter++;
            }
        });
        return counter;
    };

    const peopleCount = (): number => {
        let selectedRoleFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[2].options);
        let filteredProducts: Array<Product> = [];

        props.products.forEach(product => {
            if (isActiveProduct(product, props.viewingDate) && isProductMatchingSelectedFilters(product, locationFilter, productTagFilters)) {
                filteredProducts.push(product);
            }
        });

        let peopleCount = new Set();
        filteredProducts.forEach( product => {
            product.assignments.forEach( assignment => {
                if (selectedRoleFilters.length > 0) {
                    if (assignment.person.spaceRole && selectedRoleFilters.includes(assignment.person.spaceRole.name)) {
                        peopleCount.add(assignment.person.id);
                    }
                } else {
                    peopleCount.add(assignment.person.id);
                }
            });
        });
        return peopleCount.size + unassignedPeopleCount();
    };

    const unassignedPeopleCount = (): number => {
        let selectedRoleFilters = getSelectedFilterLabels(props.allGroupedTagFilterOptions[2].options);

        let count = 0;
        props.products.forEach(product => {
            if (product.name === 'unassigned') {
                product.assignments.forEach(assignment => {
                    if (selectedRoleFilters.length > 0) {
                        if (assignment.person.spaceRole && selectedRoleFilters.includes(assignment.person.spaceRole.name)) {
                            count++;
                        }
                    } else {
                        count++;
                    }
                });
            }
        });
        return count;
    };

    return (
        <span
            data-testid="counter">Results: {productCount()} Products, {peopleCount()} People ({unassignedPeopleCount()} Unassigned)</span>
    );
}

export default Counter;
