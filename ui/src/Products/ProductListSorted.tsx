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

import React from 'react';
import NewProductButton from './NewProductButton';

import {ProductCardArray} from '../Common/ProductCardArray';
import {useRecoilValue} from 'recoil';
import {ProductSortBy, ProductSortByState} from '../State/ProductSortByState';
import {Product} from '../Types/Product';

import './ProductListSorted.scss';

interface Props {
    products: Array<Product>;
}

function SortedByList({ products }: Props): JSX.Element {
    const productSortBy = useRecoilValue(ProductSortByState);

    const sortedProducts: Product [] = sortBy();

    function sortBy():  Array<Product> {
        switch (productSortBy) {
            case ProductSortBy.LOCATION: return [...products].sort(sortByLocation);
            case ProductSortBy.NAME: return [...products].sort(sortByProductName);
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

    return (
        <div className="productListSortedContainer" data-testid="productListSortedContainer">
            {sortedProducts && <ProductCardArray products={sortedProducts}/>}
            <NewProductButton />
        </div>
    );
}

export default SortedByList;
