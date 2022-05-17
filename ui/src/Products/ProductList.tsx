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

import React, {useEffect, useState} from 'react';
import {isActiveProduct, isProductMatchingSelectedFilters, Product} from './Product';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import GroupedByList from './ProductListGrouped';
import SortedByList from './ProductListSorted';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {useRecoilValue} from 'recoil';
import {ProductSortBy, ProductSortByState} from '../State/ProductSortByState';

interface ProductListProps {
    products: Array<Product>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
}

function ProductList({
    products,
    allGroupedTagFilterOptions,
    viewingDate,
}: ProductListProps): JSX.Element {
    const productSortBy = useRecoilValue(ProductSortByState);
    const [noFiltersApplied, setNoFiltersApplied] = useState<boolean>(false);
    const [filteredProductsLoaded, setFilteredProductsLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (allGroupedTagFilterOptions.length > 0) {
            const numberOfSelectedLocationFilters = getSelectedFilterLabels(allGroupedTagFilterOptions[0].options).length;
            const numberOfSelectedProductTagFilters = getSelectedFilterLabels(allGroupedTagFilterOptions[1].options).length;
            const totalNumberOfFiltersApplied = numberOfSelectedLocationFilters + numberOfSelectedProductTagFilters;
            setNoFiltersApplied(totalNumberOfFiltersApplied === 0);
            setFilteredProductsLoaded(true);
        }
    }, [allGroupedTagFilterOptions]);

    function ListOfProducts(): JSX.Element {
        if (filteredProductsLoaded) {
            const locationTagFilters: Array<string> = getSelectedFilterLabels(allGroupedTagFilterOptions[0].options);
            const productTagFilters: Array<string> = getSelectedFilterLabels(allGroupedTagFilterOptions[1].options);
            const filteredAndActiveProduct = products
                .filter(product => noFiltersApplied || isProductMatchingSelectedFilters(product, locationTagFilters, productTagFilters))
                .filter(prod => isActiveProduct(prod, viewingDate));

            switch (productSortBy) {
                case ProductSortBy.NAME : {
                    return <SortedByList products={filteredAndActiveProduct} />;
                }
                default:
                    return <GroupedByList products={filteredAndActiveProduct} />;
            }
        } else {
            return <></>;
        }
    }

    return <ListOfProducts/>;
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    productTags: state.productTags,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
    viewingDate: state.viewingDate,
});

export default connect(mapStateToProps)(ProductList);
/* eslint-enable */
