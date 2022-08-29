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
import {useSetRecoilState} from 'recoil';
import {ModalContentsState} from 'State/ModalContentsState';
import ProductForm from 'Common/ProductForm/ProductForm';
import {Product} from 'Types/Product';

interface Props{
    product: Product;
}

function ArchivedProduct({product}: Props): JSX.Element {
    const setModalContents = useSetRecoilState(ModalContentsState);

    const openModal = (): void => setModalContents({
        title: 'Edit Product',
        component: <ProductForm
            editing
            product={product}/>,
    })

    return (
        <div>
            <button
                className="archivedProduct"
                data-testid={`archivedProduct_${product.id}`}
                onClick={openModal}>
                <span className="archivedProductName">{product.name}</span>
                <div className="productInfoContainer">
                    <i>{product.spaceLocation && product.spaceLocation.name}</i>
                    <div className="assignmentCountContainer">
                        <span className="archivedAssignmentCount">{product.assignments ? product.assignments.length : 0}</span>
                        <i className="material-icons">person</i>
                    </div>
                </div>
            </button>
        </div>
    );
}

export default ArchivedProduct;
