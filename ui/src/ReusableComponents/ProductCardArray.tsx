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
                <span key={product.id} id={createProductId(index, arrayId)} >
                    { index + 1 < products.length &&
                        (<a href={`#${createProductId(index + 1, arrayId)}`} className="skipToNextProduct">
                            Skip to next product
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
