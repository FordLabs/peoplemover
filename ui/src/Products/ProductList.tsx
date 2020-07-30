/*
 * Copyright (c) 2019 Ford Motor Company
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
import {GlobalStateProps} from '../Redux/Reducers';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {FilterOption} from '../CommonTypes/Option';
import moment from 'moment';
import {ProductTag} from '../ProductTag/ProductTag';
import GroupedByList from './ProductListGrouped';
import SortedByList from './ProductListSorted';

interface ProductListProps {
    products: Array<Product>;
    productTags: Array<ProductTag>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
    productSortBy: string;
}

export function getSelectedTagsFromGroupedTagOptions(tagFilters: Array<FilterOption>): Array<string> {
    const selectedOptions = tagFilters.filter(option => option.selected);
    return selectedOptions.map(value => value.label);
}

function ProductList({
    products,
    productTags,
    allGroupedTagFilterOptions,
    viewingDate,
    productSortBy,
}: ProductListProps ): JSX.Element {
    const [noFiltersApplied, setNoFiltersApplied] = useState<boolean>(false);

    useEffect(() => {
        if (allGroupedTagFilterOptions.length > 0 ) {
            const numberOfLocationFiltersApplied = getSelectedTagsFromGroupedTagOptions(allGroupedTagFilterOptions[0].options).length;
            const numberOfProductTagFiltersApplied = getSelectedTagsFromGroupedTagOptions(allGroupedTagFilterOptions[1].options).length;
            const totalNumberOfFiltersApplied = numberOfLocationFiltersApplied + numberOfProductTagFiltersApplied;
            setNoFiltersApplied(totalNumberOfFiltersApplied === 0);
        }
    }, [allGroupedTagFilterOptions]);

    function isActiveProduct(product: Product): boolean {
        return product.name.toLowerCase() !== 'unassigned'
            && !product.archived
            && (product.endDate == null || product.endDate >= moment(viewingDate).format('YYYY-MM-DD'));
    }

    function permittedByFilters(product: Product): boolean {
        let isLocationFilterOn = false;
        let isProductTagFilterOn = false;
        const locationTagFilters: Array<string> = getSelectedTagsFromGroupedTagOptions(allGroupedTagFilterOptions[0].options);
        const productTagFilters: Array<string> = getSelectedTagsFromGroupedTagOptions(allGroupedTagFilterOptions[1].options);
        if (product.spaceLocation && locationTagFilters.includes(product.spaceLocation.name)) {
            isLocationFilterOn = true;
        }
        if (product.productTags) {
            const productTagNames: Array<string> = product.productTags.map(productTag => productTag.name);
            productTagFilters.forEach(productTagFilter => {
                if (productTagNames.includes(productTagFilter)) {
                    isProductTagFilterOn = true;
                }
            });
        }
        return isProductTagFilterOn || isLocationFilterOn;
    }

    function ListOfProducts(): JSX.Element {
        const productFiltersLoaded = allGroupedTagFilterOptions.length > 0;
        if (productFiltersLoaded) {
            const filteredAndActiveProduct = products
                .filter(product => noFiltersApplied || permittedByFilters(product))
                .filter(isActiveProduct);

            switch (productSortBy) {
                case 'product-tag': {
                    return <GroupedByList
                        products={filteredAndActiveProduct}
                        productTags={productTags}/>;
                }
                default:
                    return <SortedByList
                        products={filteredAndActiveProduct}
                        productSortBy={productSortBy}/>;
            }
        } else {
            return <></>;
        }
    }

    return <ListOfProducts/>;
}

const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    productTags: state.productTags,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
    viewingDate: state.viewingDate,
    productSortBy: state.productSortBy,
});

export default connect(mapStateToProps)(ProductList);
