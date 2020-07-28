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

import {ProductTag} from '../ProductTag/ProductTag';
import ProductCard from './ProductCard';
import React from 'react';
import {Product} from './Product';
import NewProductButton from './NewProductButton';

import './ProductListGrouped.scss';

interface GroupedByListProps {
    products: Array<Product>;
    productTags: Array<ProductTag>;
}

interface ProductGroupProps {
    tagName: string;
    productFilterFunction: (product: Product, tagName: string) => boolean;
    useGrayBackground?: boolean;
}

function GroupedByList({ productTags, products }: GroupedByListProps): JSX.Element {
    function filterByProductTag(product: Product, tagName: string): boolean {
        return product.productTags.map(t => t.name).includes(tagName);
    }

    function filterByNoProductTag(product: Product): boolean {
        return (product.productTags || []).length === 0;
    }

    function ProductGroup({tagName, productFilterFunction, useGrayBackground }: ProductGroupProps): JSX.Element {
        return (
            <div data-testid="productGroup" key={tagName}>
                <div className={`productTagName ${useGrayBackground ? 'gray-background' : ''}`}>{tagName}</div>
                <div className="groupedProducts">
                    {products.filter(product => productFilterFunction(product, tagName))
                        .map(product => (
                            <span key={product.id}>
                                <ProductCard
                                    product={product}
                                    container="productCardContainer" />
                            </span>
                        ))
                    }
                    <NewProductButton />
                </div>
            </div>
        );
    }

    return ( 
        <div className="productListGroupedContainer" data-testid="productListGroupedContainer">
            {productTags && productTags.map((tag: ProductTag) => {
                return (
                    <span key={tag.id}>
                        <ProductGroup
                            tagName={tag.name}
                            productFilterFunction={filterByProductTag}/>
                    </span>
                );
            })}
            <ProductGroup
                tagName="No Product Tag"
                useGrayBackground
                productFilterFunction={filterByNoProductTag}/>
        </div>
    );
}

export default GroupedByList;