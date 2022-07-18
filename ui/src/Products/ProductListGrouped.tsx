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

import React from 'react';
import {emptyProduct} from './ProductService';
import NewProductButton from './NewProductButton';
import {useRecoilValue} from 'recoil';

import {ProductCardArray} from 'ReusableComponents/ProductCardArray';
import {ProductSortBy, ProductSortByState} from 'State/ProductSortByState';
import {LocationsState} from 'State/LocationsState';
import {ProductTagsState} from 'State/ProductTagsState';
import {ModalContents} from 'State/ModalContentsState';
import ProductForm from './ProductForm';
import {UUIDForCurrentSpaceSelector} from 'State/CurrentSpaceState';
import {Tag} from 'Types/Tags';
import {Product} from 'Types/Product';

import './ProductListGrouped.scss';

interface GroupedByListProps {
    products: Array<Product>;
}

interface GroupedListDataProps {
    traitTitle: string;
    traits: Array<Tag>;
    filterByTraitFunction: (product: Product, tagName: string) => boolean;
    filterByNoTraitFunction: (product: Product) => boolean;
}

interface ProductGroupProps {
    tagName: string;
    modalContents?: ModalContents;
    productFilterFunction: (product: Product, tagName: string) => boolean;
    useGrayBackground?: boolean;
}

function GroupedByList({ products }: GroupedByListProps): JSX.Element {
    const locations = useRecoilValue(LocationsState);
    const productSortBy = useRecoilValue(ProductSortByState);
    const productTags = useRecoilValue(ProductTagsState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const productGroupList = sortProducts();

    function sortProducts(): GroupedListDataProps {
        if (productSortBy === ProductSortBy.LOCATION) {
            return ({
                traitTitle: 'Location',
                traits: [...locations],
                filterByTraitFunction: filterByLocation,
                filterByNoTraitFunction: filterByNoLocation,
            });
        } else {
            return ({
                traitTitle: 'Product Tag',
                traits: [...productTags],
                filterByTraitFunction: filterByProductTag,
                filterByNoTraitFunction: filterByNoProductTag,
            });
        }
    }

    function filterByProductTag(product: Product, tagName: string): boolean {
        return product.tags.map(t => t.name).includes(tagName);
    }

    function filterByNoProductTag(product: Product): boolean {
        return (product.tags || []).length === 0;
    }

    function filterByLocation(product: Product, tagName: string): boolean {
        return (product.spaceLocation) ? product.spaceLocation.name === tagName : false;
    }

    function filterByNoLocation(product: Product): boolean {
        return !product.spaceLocation;
    }

    function ProductGroup({tagName, modalContents, productFilterFunction, useGrayBackground }: ProductGroupProps): JSX.Element {
        const filteredProducts = products.filter(product => productFilterFunction(product, tagName));

        return (
            filteredProducts.length === 0 ? <></> :
                (
                    <div data-testid="productGroup" key={tagName}>
                        <div className={`productTagName ${useGrayBackground ? 'gray-background' : ''}`}>{tagName}</div>
                        <div className="groupedProducts">
                            <ProductCardArray products={filteredProducts} arrayId={tagName}/>
                            <NewProductButton modalContents={modalContents}/>
                        </div>
                    </div>
                )
        );
    }

    return (
        <div className="productListGroupedContainer" data-testid="productListGroupedContainer">
            {productGroupList.traits.map((trait: Tag) => {
                const newProduct = emptyProduct(uuid);
                if (productSortBy === ProductSortBy.LOCATION) {
                    newProduct.spaceLocation = {...trait}
                } else if (productSortBy === ProductSortBy.PRODUCT_TAG) {
                    newProduct.tags = [trait]
                }

                return (
                    <span key={trait.id}>
                        <ProductGroup
                            tagName={trait.name}
                            modalContents={{
                                title: 'Add New Product',
                                component: <ProductForm
                                    editing={false}
                                    product={newProduct}/>
                            }}
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

export default GroupedByList;
