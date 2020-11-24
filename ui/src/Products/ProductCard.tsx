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

import React, {RefObject, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
    AvailableModals,
    fetchProductsAction,
    registerProductRefAction,
    setCurrentModalAction,
    unregisterProductRefAction,
} from '../Redux/Actions';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';
import ProductClient from './ProductClient';
import {ProductCardRefAndProductPair} from './ProductDnDHelper';
import {Product} from './Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AxiosResponse} from 'axios';
import AssignmentCardList from '../Assignments/AssignmentCardList';
import moment from 'moment';
import {Space} from '../Space/Space';
import {createDataTestId} from '../tests/TestUtils';

import './Product.scss';

interface ProductCardProps {
    container: string;
    product: Product;
    currentSpace: Space;
    viewingDate: Date;
    isReadOnly: boolean;

    registerProductRef(productRef: ProductCardRefAndProductPair): void;
    unregisterProductRef(productRef: ProductCardRefAndProductPair): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchProducts(): void;
}

function ProductCard({
    container,
    product,
    currentSpace,
    viewingDate,
    isReadOnly,
    registerProductRef,
    unregisterProductRef,
    setCurrentModal,
    fetchProducts,
}: ProductCardProps): JSX.Element {

    const [isEditMenuOpen, setIsEditMenuOpen] = useState<boolean>(false);
    const productRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

    /* eslint-disable */
    useEffect(() => {
        registerProductRef({ref: productRef, product});

        return () => {
            unregisterProductRef({ref: productRef, product});
        };
    }, []);
    /* eslint-enable */

    function toggleEditMenu(): void {
        if (isEditMenuOpen) {
            setIsEditMenuOpen(false);
        } else {
            setIsEditMenuOpen(true);
        }
    }

    function getMenuOptionList(): Array<EditMenuOption> {
        return [
            {
                callback: editProductAndCloseEditMenu,
                text: 'Edit Product',
                icon: 'create',
            },
            {
                callback: archiveProductAndCloseEditMenu,
                text: 'Archive Product',
                icon: 'inbox',
            },
        ];
    }

    function editProductAndCloseEditMenu(): void {
        setIsEditMenuOpen(false);
        const newModal: CurrentModalState = {
            modal: AvailableModals.EDIT_PRODUCT,
            item: product,
        };
        setCurrentModal(newModal);
    }

    function archiveProductAndCloseEditMenu(): void {
        toggleEditMenu();
        archiveProduct().then(fetchProducts);
    }

    function archiveProduct(): Promise<AxiosResponse | void> {
        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return Promise.resolve();
        }
        const archivedProduct = {...product, endDate: moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD')};
        return ProductClient.editProduct(currentSpace, archivedProduct, true);
    }

    const setCurrentModalToCreateAssignment = (): void => setCurrentModal({
        modal: AvailableModals.CREATE_ASSIGNMENT,
        item: product,
    });

    function handleKeyDownForSetCurrentModalToCreateAssignment(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            setCurrentModalToCreateAssignment();
        }
    }

    function handleKeyDownForToggleEditMenu(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            toggleEditMenu();
        }
    }

    const TagList = (): JSX.Element => {
        const locationTag = product.spaceLocation?.name;
        const locationTagExists = !!locationTag;
        const productTagExists = product.productTags.length > 0;

        return locationTagExists || productTagExists ?
            <p className="productTagContainer">
                <span>{locationTag}</span>
                {locationTagExists && productTagExists && <span>, </span>}
                {product.productTags.map((tag, index) => {
                    if (index < product.productTags.length - 1) {
                        return <span key={tag.id}>{tag.name}, </span>;
                    }
                    return <span key={tag.id}>{tag.name}</span>;
                })}
            </p>
            : <></>;
    };

    return (
        <div className={container} data-testid={createDataTestId(container, product.name)} ref={productRef}>
            <div key={product.name}>
                {container === 'productCardContainer' && (
                    <div>
                        <div className="productNameEditContainer">
                            <div className="productDetails">
                                <h2 className="productName" data-testid="productName">
                                    {product.name}
                                </h2>
                                <div className="productControlsContainer">
                                    <div className="addPersonIconContainer">
                                        <button data-testid={createDataTestId('addPersonToProductIcon', product.name)}
                                            className="addPersonIcon material-icons greyIcon clickableIcon"
                                            disabled={isReadOnly}
                                            onClick={setCurrentModalToCreateAssignment}
                                            onKeyDown={(e): void => handleKeyDownForSetCurrentModalToCreateAssignment(e)}>
                                            person_add
                                        </button>
                                    </div>
                                    <button disabled={isReadOnly}
                                        className="editIcon material-icons greyIcon clickableIcon"
                                        data-testid={createDataTestId('editProductIcon', product.name)}
                                        onClick={toggleEditMenu}
                                        onKeyDown={(e): void => handleKeyDownForToggleEditMenu(e)}>
                                        more_vert
                                    </button>
                                </div>
                            </div>
                            <TagList />
                            {
                                isEditMenuOpen &&
                                <EditMenu menuOptionList={getMenuOptionList()}
                                    onClosed={toggleEditMenu}/>
                            }
                        </div>
                        {!isReadOnly && product.assignments.length === 0 && (
                            <div className="emptyProductText">
                                <div className="emptyProductTextHint">
                                    <p>Add a person by clicking</p>
                                    <i className="material-icons greyIcon addPersonIcon">person_add</i>
                                </div>
                                <p>above, or drag them in.</p>
                            </div>
                        )}
                    </div>
                )}
                <AssignmentCardList container={container} product={product} />
            </div>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
    registerProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(registerProductRefAction(productRef)),
    unregisterProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(unregisterProductRefAction(productRef)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductCard);
/* eslint-enable */