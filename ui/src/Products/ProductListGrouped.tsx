/*
 * Copyright (c) 2020 Ford Motor Company
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
import ProductCard from './ProductCard';
import {Product} from './Product';
import NewProductButton from './NewProductButton';
import {AvailableModals} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Tag} from '../Tags/Tag.interface';
import {GlobalStateProps, SortByType} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {ProductTag} from '../ProductTag/ProductTag';
import {Location} from '../Locations/Location.interface';

import './ProductListGrouped.scss';

interface GroupedByListProps {
    products: Array<Product>;
    productSortBy: SortByType;
    productTags: Array<ProductTag>;
    locations: Array<Location>;
}

interface GroupedListDataProps {
    traitTitle: string;
    traits: Array<Tag>;
    modalType: AvailableModals | null;
    filterByTraitFunction: (product: Product, tagName: string) => boolean;
    filterByNoTraitFunction: (product: Product) => boolean;
}

interface ProductGroupProps {
    tagName: string;
    modalState?: CurrentModalState;
    productFilterFunction: (product: Product, tagName: string) => boolean;
    useGrayBackground?: boolean;
}

function GroupedByList({
    productSortBy,
    products,
    productTags,
    locations,
}: GroupedByListProps): JSX.Element {
    let productGroupList = sortProducts();

    function sortProducts(): GroupedListDataProps {
        if (productSortBy === 'location') {
            return ({
                traitTitle: 'Location',
                traits: [...locations],
                modalType: AvailableModals.CREATE_PRODUCT_OF_LOCATION,
                filterByTraitFunction: filterByLocation,
                filterByNoTraitFunction: filterByNoLocation,
            });
        } else {
            return ({
                traitTitle: 'Product Tag',
                traits: [...productTags],
                modalType: AvailableModals.CREATE_PRODUCT_OF_PRODUCT_TAG,
                filterByTraitFunction: filterByProductTag,
                filterByNoTraitFunction: filterByNoProductTag,
            });
        }
    }

    function filterByProductTag(product: Product, tagName: string): boolean {
        return product.productTags.map(t => t.name).includes(tagName);
    }

    function filterByNoProductTag(product: Product): boolean {
        return (product.productTags || []).length === 0;
    }

    function filterByLocation(product: Product, tagName: string): boolean {
        return (product.spaceLocation) ? product.spaceLocation.name === tagName : false;
    }

    function filterByNoLocation(product: Product): boolean {
        return !product.spaceLocation;
    }

    function ProductGroup({tagName, modalState, productFilterFunction, useGrayBackground }: ProductGroupProps): JSX.Element {
        const filteredProducts = products.filter(product => productFilterFunction(product, tagName));

        return (
            filteredProducts.length === 0 ? <></> :
                (
                    <div data-testid="productGroup" key={tagName}>
                        <div className={`productTagName ${useGrayBackground ? 'gray-background' : ''}`}>{tagName}</div>
                        <div className="groupedProducts">
                            {filteredProducts.map(product => (
                                <span key={product.id}>
                                    <ProductCard
                                        product={product}
                                        container="productCardContainer"/>
                                </span>
                            ))}
                            <NewProductButton modalState={modalState}/>
                        </div>
                    </div>
                )
        );
    }

    return (
        <div className="productListGroupedContainer" data-testid="productListGroupedContainer">
            {productGroupList.traits.map((trait: Tag) => {
                return (
                    <span key={trait.id}>
                        <ProductGroup
                            tagName={trait.name}
                            modalState={{modal: productGroupList.modalType, item: trait}}
                            productFilterFunction={productGroupList.filterByTraitFunction}/>
                    </span>
                );
            })}
            { products.length === 0 ?
                <NewProductButton /> :
                <ProductGroup
                    tagName={`No ${productGroupList.traitTitle}`}
                    useGrayBackground
                    productFilterFunction={productGroupList.filterByNoTraitFunction}/>
            }
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    productTags: state.productTags,
    locations: state.locations,
});

export default connect(mapStateToProps)(GroupedByList);
