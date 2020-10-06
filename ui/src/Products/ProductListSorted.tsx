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

import React, {useEffect, useState} from 'react';
import {Product} from './Product';
import ProductCard from './ProductCard';
import NewProductButton from './NewProductButton';

import './ProductListSorted.scss';

interface Props {
    products: Array<Product>;
    productSortBy: string;
}

function SortedByList({ products, productSortBy}: Props): JSX.Element {
    const [sortedProducts, setSortedProducts] = useState<Array<Product>>([...products]);
    const [productsSorted, setProductsSorted] = useState<boolean>(false);

    useEffect(() => {
        function sortBy(products: Array<Product>, productSortBy: string):  Array<Product> {
            switch (productSortBy) {
                case 'location': return [...products].sort(sortByLocation);
                case 'name': return [...products].sort(sortByProductName);
                default: return [...products];
            }
        }

        function sortByProductName(productA: Product, productB: Product): number {
            return productA.name.toLowerCase().localeCompare(productB.name.toLowerCase());
        }

        function getSpaceLocationNameSafely(product: Product): string {
            return product.spaceLocation ? product.spaceLocation.name : 'ZZZZZZZZ';
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

        if (products && products.length) {
            setSortedProducts(sortBy(products, productSortBy));
        }
        setProductsSorted(true);
    }, [products, productSortBy]);

    return (
        <div className="productListSortedContainer" data-testid="productListSortedContainer">
            {productsSorted && sortedProducts && sortedProducts.map((product: Product) => {
                return (
                    <span key={product.id}>
                        <ProductCard
                            product={product}
                            container="productCardContainer"/>
                    </span>
                );
            })}
            <NewProductButton />
        </div>
    );
}

export default SortedByList;
