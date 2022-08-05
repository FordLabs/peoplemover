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

import React, {useCallback, useState} from 'react';
import {
    getLocalStorageFiltersByType,
    locationTagsFilterKey,
    personTagsFilterKey,
    productTagsFilterKey,
    roleTagsFilterKey,
} from 'Common/SubHeader/SortingAndFiltering/FilterLibraries';
import {
    isActiveProduct,
    isProductMatchingSelectedFilters,
    stripAssignmentsForArchivedPeople,
} from 'Services/ProductService';
import {isPersonMatchingSelectedFilters} from 'Services/PersonService';
import {useRecoilValue} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState, UnassignedProductSelector} from 'State/ProductsState';
import useOnStorageChange from 'Hooks/useOnStorageChange/useOnStorageChange';
import {Product} from 'Types/Product';

import './Counter.scss';

function Counter(): JSX.Element {
    const products = useRecoilValue(ProductsState);
    const unassignedProduct = useRecoilValue(UnassignedProductSelector);
    const viewingDate = useRecoilValue(ViewingDateState);

    const [filteredAndActiveProduct, setFilteredAndActiveProducts] = useState<Product[]>([]);
    const [filteredAndActivePeopleCount, setFilteredAndActivePeopleCount] = useState<number>(0);

    const getFilteredAndActivePeopleCount = useCallback((activeProducts: Product[]): number => {
        const peopleSet = new Set<number>();

        activeProducts.forEach(product => {
            const productPeopleCount = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(product);
            productPeopleCount.forEach(entry => {
                peopleSet.add(entry);
            });
        });

        return peopleSet.size;
    }, []);

    const getFilteredAndActiveProducts = useCallback(() => {
        const locationTagFilters: string[] = getLocalStorageFiltersByType(locationTagsFilterKey);
        const productTagFilters: string[] = getLocalStorageFiltersByType(productTagsFilterKey);
        const noFiltersApplied = !locationTagFilters.length && !productTagFilters.length;
        const filteredProducts = products
            .filter(product => noFiltersApplied || isProductMatchingSelectedFilters(product, locationTagFilters, productTagFilters))
            .filter(prod => isActiveProduct(prod, viewingDate));
        setFilteredAndActiveProducts(filteredProducts);
        setFilteredAndActivePeopleCount(getFilteredAndActivePeopleCount(filteredProducts))
    }, [getFilteredAndActivePeopleCount, products, viewingDate]);

    useOnStorageChange(getFilteredAndActiveProducts);

    const getUnassignedPeopleCount = () => {
        const unassignedWithoutArchived = stripAssignmentsForArchivedPeople(unassignedProduct, viewingDate);
        const unassignedPeopleSet = getSetOfPersonIdsForAProductByRoleAndPersonTagFilters(unassignedWithoutArchived);
        return unassignedPeopleSet.size;
    }

    const getSetOfPersonIdsForAProductByRoleAndPersonTagFilters = (product: Product): Set<number> => {
        const selectedRoleFilters = getLocalStorageFiltersByType(roleTagsFilterKey);
        const selectedPersonTagFilters = getLocalStorageFiltersByType(personTagsFilterKey);
        const peopleSet = new Set<number>();

        product.assignments.forEach(assignment => {
            if (isPersonMatchingSelectedFilters(assignment.person, selectedRoleFilters, selectedPersonTagFilters)) {
                peopleSet.add(assignment.person.id);
            }
        });

        return peopleSet;
    };

    const productCount = filteredAndActiveProduct.length;
    const unassignedPeopleCount = getUnassignedPeopleCount();
    const totalPeopleCount = filteredAndActivePeopleCount + unassignedPeopleCount;

    return (
        <div className="counter-container">
            <span className="counter" data-testid="counter">
                Results - Products: {productCount}, People: {totalPeopleCount} (Unassigned: {unassignedPeopleCount})
            </span>
        </div>
    );
}

export default Counter;
