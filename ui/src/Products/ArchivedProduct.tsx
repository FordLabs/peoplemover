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
import {connect} from 'react-redux';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {Product} from './Product';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';

interface ArchiveProductProps{
    product: Product;
    setCurrentModal(modalState: CurrentModalState): void;
}

function ArchivedProduct({product, setCurrentModal}: ArchiveProductProps): JSX.Element {

    return (
        <div>
            <button className="archivedProduct" data-testid={`archivedProduct_${product.id}`}
                onClick={(): void => setCurrentModal({modal: AvailableModals.EDIT_PRODUCT, item: product})}>
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

/* eslint-disable */
const mapDispatchToProps = (dispatch:  Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(ArchivedProduct);
/* eslint-enable */
