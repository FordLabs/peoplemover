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
import {Product} from '../Products/Product';
import ProductCard from '../Products/ProductCard';
import React from 'react';

interface ProductCardArrayProps {
    products: Array<Product>;
    arrayId?: string;
}

export function ProductCardArray({
    products,
    arrayId,
}: ProductCardArrayProps): JSX.Element {
    return (
        <>
            {products.map((product, index) => (
                <span key={product.id} id={createProductId(index, arrayId)} className="productCardSpan" data-testid={createProductId(index, arrayId)}>
                    { index + 1 < products.length &&
                        (<a href={`#${createProductId(index + 1, arrayId)}`} className="skipToNextProduct" data-testid={createProductId(index + 1, arrayId)}>
                            {`Skip to ${products[index + 1].name}`}
                        </a>)
                    }
                    <ProductCard product={product} />
                </span>
            ))}
        </>
    );
}

function createProductId(index: number, stringToConvert?: string): string {
    return `product-card-${
        stringToConvert ?
            stringToConvert
                .toLowerCase()
                .replace(' ', '-') + '-'
            : ''
    }${index}`;
}
