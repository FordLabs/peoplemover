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

interface Props {
    products: Array<Product>;
    productTags: Array<ProductTag>;
}

function GroupedByList({ productTags, products }: Props): JSX.Element {
    function filterByProductTag(product: Product, tagName: string): boolean {
        return product.productTags.map(t => t.name).includes(tagName);
    }

    return <>
        {
            productTags && productTags.map((tag: ProductTag) => {
                return (
                    <div data-testid="productGroup" key={tag.name}>
                        <div className="productTagBar">{tag.name}</div>
                        {products
                            .filter(product => filterByProductTag(product, tag.name))
                            .map(product => (
                                <div key={product.id}>
                                    <ProductCard
                                        product={product}
                                        container="productCardContainer" />
                                </div>
                            ))
                        }
                    </div>
                );
            })
        }
    </>;
}

export default GroupedByList;