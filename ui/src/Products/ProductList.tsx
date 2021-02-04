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
import {Product} from './Product';
import {connect} from 'react-redux';
import {GlobalStateProps, SortByType} from '../Redux/Reducers';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import moment from 'moment';
import GroupedByList from './ProductListGrouped';
import SortedByList from './ProductListSorted';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';

interface ProductListProps {
    products: Array<Product>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
    productSortBy: SortByType;
}

function ProductList({
    products,
    allGroupedTagFilterOptions,
    viewingDate,
    productSortBy,
}: ProductListProps): JSX.Element {
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

    function isActiveProduct(product: Product): boolean {
        return product.name.toLowerCase() !== 'unassigned'
            && !product.archived
            && (product.endDate == null || product.endDate >= moment(viewingDate).format('YYYY-MM-DD'));
    }

    function permittedByFilters(product: Product): boolean {
        let isPermittedByLocationFilter = false;
        let isPermittedByProductTagFilter = false;
        const locationTagFilters: Array<string> = getSelectedFilterLabels(allGroupedTagFilterOptions[0].options);
        const productTagFilters: Array<string> = getSelectedFilterLabels(allGroupedTagFilterOptions[1].options);
        if ((product.spaceLocation && locationTagFilters.includes(product.spaceLocation.name))
            || locationTagFilters.length === 0) {
            isPermittedByLocationFilter = true;
        }
        if (product.productTags) {
            const productTagNames: Array<string> = product.productTags.map(productTag => productTag.name);
            productTagFilters.forEach(productTagFilter => {
                if (productTagNames.includes(productTagFilter)) {
                    isPermittedByProductTagFilter = true;
                }
            });
        }
        if (productTagFilters.length === 0) {
            isPermittedByProductTagFilter = true;
        }
        return isPermittedByProductTagFilter && isPermittedByLocationFilter;
    }

    function ListOfProducts(): JSX.Element {
        if (filteredProductsLoaded) {
            const filteredAndActiveProduct = products
                .filter(product => noFiltersApplied || permittedByFilters(product))
                .filter(isActiveProduct);

            switch (productSortBy) {
                case 'name' : {
                    return <SortedByList
                        products={filteredAndActiveProduct}
                        productSortBy={productSortBy}/>;
                }
                default:
                    return <GroupedByList
                        products={filteredAndActiveProduct}
                        productSortBy={productSortBy}/>;
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
    productSortBy: state.productSortBy,
});

export default connect(mapStateToProps)(ProductList);
/* eslint-enable */