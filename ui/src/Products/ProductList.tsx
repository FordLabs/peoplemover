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
import ProductCard from './ProductCard';
import {Product} from './Product';
import {connect} from 'react-redux';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {GlobalStateProps} from '../Redux/Reducers';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {FilterOption} from '../CommonTypes/Option';
import {Dispatch} from 'redux';
import moment from 'moment';

interface ProductListProps {
    products: Array<Product>;
    setCurrentModal(modalState: CurrentModalState): void;
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
    setCurrentModal,
    allGroupedTagFilterOptions,
    viewingDate,
    productSortBy,
}: ProductListProps ): JSX.Element {
    const [noFiltersApplied, setNoFiltersApplied] = useState<boolean>(false);
    const [sortedProducts, setSortedProducts] = useState<Array<Product>>([...products]);

    useEffect(() => {
        if (products && products.length) {
            setSortedProducts(sortBy(products, productSortBy));
        }
    }, [products, productSortBy]);

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

    function sortBy(products: Array<Product>, productSortBy: string): Array<Product> {
        switch (productSortBy) {
            case ('location'): return [...products].sort(sortByLocation);
            case ('name'): return [...products].sort(sortByProductName);
            default: return [...products];
        }
    }

    function sortByProductName(productAName: Product, productBName: Product): number {
        return productAName.name.toLowerCase().localeCompare(productBName.name.toLowerCase());
    }

    function sortByLocation(productA: Product, productB: Product): number {
        const locationA = getSpaceLocationNameSafely(productA);
        const locationB = getSpaceLocationNameSafely(productB);

        const comparisonValue: number = locationA.toLowerCase().localeCompare(locationB.toLowerCase());
        if (comparisonValue === 0) {
            return sortByProductName(productA, productB);
        }
        return comparisonValue;
    }

    function getSpaceLocationNameSafely(product: Product): string {
        return product.spaceLocation ? product.spaceLocation.name : 'ZZZZZZZZ';
    }

    return (
        <div className="productListContainer" data-testid="productListContainer">
            {sortedProducts && sortedProducts.map((product: Product) => {
                const productFiltersLoaded = allGroupedTagFilterOptions.length > 0;
                if (productFiltersLoaded
                    && isActiveProduct(product)
                    && (noFiltersApplied || permittedByFilters(product))) {
                    return (
                        <div key={product.id}>
                            <ProductCard
                                product={product}
                                container={'productCardContainer'}/>
                        </div>
                    );
                }
                return <div key={product.id}/>;
            })}
            <div className="newProduct productCardContainer" onClick={() => setCurrentModal({modal: AvailableModals.CREATE_PRODUCT})} data-cy="newProductButton">
                <div className="fa fa-plus greyIcon addProductIcon fa-sm"/>
                <h2 className="newProductText">New Product</h2>
            </div>
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
    viewingDate: state.viewingDate,
    productSortBy: state.productSortBy,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);
