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

import {useRecoilState, useRecoilValue} from 'recoil';
import {useCallback} from 'react';
import {Product} from '../Products/Product';
import {ProductsState} from '../State/ProductsState';
import ProductClient from '../Products/ProductClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {useParams} from 'react-router-dom';

interface UseFetchProducts {
    products: Product[];
    fetchProducts(): void
}

function useFetchProducts(): UseFetchProducts {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const [products, setProducts] = useRecoilState(ProductsState);
    const viewingDate = useRecoilValue(ViewingDateState);

    const fetchProducts = useCallback(() => {
        ProductClient.getProductsForDate(teamUUID, viewingDate)
            .then(result => setProducts(result.data || [])).catch(console.error);
    }, [setProducts, teamUUID, viewingDate])

    return {
        products: products || [],
        fetchProducts
    };
}

export default useFetchProducts;