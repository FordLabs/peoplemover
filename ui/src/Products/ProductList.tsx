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
import {Board} from '../Boards/Board';
import {AllGroupedTagFilterOptions} from '../ReusableComponents/ProductFilter';
import {FilterOption} from '../CommonTypes/Option';
import {Dispatch} from 'redux';
import {Space} from "../SpaceDashboard/Space";

interface ProductListProps {
    currentBoard: Board;
    currentSpace: Space;
    setCurrentModal(modalState: CurrentModalState): void;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}

export function getSelectedTagsFromGroupedTagOptions(tagFilters: Array<FilterOption>): Array<string> {
    const selectedOptions = tagFilters.filter(option => option.selected);
    return selectedOptions.map(value => value.label);
}

function ProductList({
    currentBoard,
    setCurrentModal,
    allGroupedTagFilterOptions,
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
        return product.name.toLowerCase() !== 'unassigned' && !product.archived;
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

    return (
        <div className="productListContainer" data-testid="productListContainer">
            {currentBoard.products && currentBoard.products.map((product: Product) => {
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
            <div className="newProduct productCardContainer" onClick={() => setCurrentModal({modal: AvailableModals.CREATE_PRODUCT})}>
                <div className="fa fa-plus greyIcon addProductIcon fa-sm"/>
                <h2 className="newProductText">New Product</h2>
            </div>
        </div>
    );
}

const mapStateToProps = ({
    currentBoard,
    currentSpace,
    allGroupedTagFilterOptions,
}: GlobalStateProps) => ({
    currentBoard,
    currentSpace,
    allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductList);