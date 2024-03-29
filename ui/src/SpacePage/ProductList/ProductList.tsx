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

import React, {useCallback, useState} from 'react';
import {isActiveProduct, isProductMatchingSelectedFilters} from 'Services/ProductService';
import GroupedByList from './ProductListGrouped/ProductListGrouped';
import SortedByList from './ProductListSorted/ProductListSorted';
import {useRecoilValue} from 'recoil';
import {ProductSortBy, ProductSortByState} from 'State/ProductSortByState';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {
    getLocalStorageFiltersByType,
    locationTagsFilterKey,
    productTagsFilterKey,
} from 'SubHeader/SortingAndFiltering/FilterLibraries';
import useOnStorageChange from 'Hooks/useOnStorageChange/useOnStorageChange';
import {Product} from 'Types/Product';

function ProductList(): JSX.Element {
    const productSortBy = useRecoilValue(ProductSortByState);
    const viewingDate = useRecoilValue(ViewingDateState);
    const products = useRecoilValue(ProductsState);

    const [filteredAndActiveProduct, setFilteredAndActiveProducts] = useState<Product[]>([]);

    const getFilteredAndActiveProducts = useCallback(() => {
        const locationTagFilters: string[] = getLocalStorageFiltersByType(locationTagsFilterKey);
        const productTagFilters: string[] = getLocalStorageFiltersByType(productTagsFilterKey);
        const noFiltersApplied = !locationTagFilters.length && !productTagFilters.length;
        const filteredProducts = products
            .filter(product => noFiltersApplied || isProductMatchingSelectedFilters(product, locationTagFilters, productTagFilters))
            .filter(prod => isActiveProduct(prod, viewingDate));
        setFilteredAndActiveProducts(filteredProducts);
    }, [products, viewingDate]);

    useOnStorageChange(getFilteredAndActiveProducts);

    if (productSortBy === ProductSortBy.NAME) {
        return <SortedByList products={filteredAndActiveProduct}/>;
    }

    return <GroupedByList products={filteredAndActiveProduct} />;
}

export default ProductList;
