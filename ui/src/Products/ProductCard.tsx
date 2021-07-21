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

import React, {RefObject, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
    fetchProductsAction,
    registerProductRefAction,
    setCurrentModalAction,
    unregisterProductRefAction,
} from '../Redux/Actions';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';
import ProductClient from './ProductClient';
import {ProductCardRefAndProductPair} from './ProductDnDHelper';
import {isUnassignedProduct, Product} from './Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AxiosResponse} from 'axios';
import AssignmentCardList from '../Assignments/AssignmentCardList';
import moment from 'moment';
import {Space} from '../Space/Space';
import {createDataTestId} from '../tests/TestUtils';

import './Product.scss';
import {AvailableModals} from '../Modal/AvailableModals';

interface ProductCardProps {
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

    function handleClickForProductUrl(): void {
        if (product.url) {
            window.open(product.url);
        }
    }

    function handleKeyDownForProductUrl(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            handleClickForProductUrl();
        }
    }

    function createProductClassName(): string {
        return 'productName' + (product.url ? ' productNameUrl' : '');
    }

    function listenKeyUp(event: React.KeyboardEvent): void {
        if (event.key === 'ArrowDown' && !isEditMenuOpen) {
            toggleEditMenu();
        }
    }

    const generateIdName = (): string => {
        return `product-card-edit-menu-icon_${product.id}`;
    };

    const TagList = (): JSX.Element => {
        const locationTag = product.spaceLocation?.name;
        const locationTagExists = !!locationTag;
        const productTagExists = product.tags.length > 0;

        return locationTagExists || productTagExists ?
            <p className="productTagContainer">
                <span>{locationTag}</span>
                {locationTagExists && productTagExists && <span>, </span>}
                {product.tags.map((tag, index) => {
                    if (index < product.tags.length - 1) {
                        return <span key={tag.id}>{tag.name}, </span>;
                    }
                    return <span key={tag.id}>{tag.name}</span>;
                })}
            </p>
            : <></>;
    };

    const classNameAndDataTestId = isUnassignedProduct(product) ? 'productDrawerContainer' : 'productCardContainer';

    return (
        <div className={classNameAndDataTestId} data-testid={createDataTestId(classNameAndDataTestId, product.name)} ref={productRef}>
            <div key={product.name}>
                {!isUnassignedProduct(product) && (
                    <div>
                        <div className="productNameEditContainer">
                            <div className="productDetails">
                                <div className={createProductClassName()} data-testid="productName" onClick={handleClickForProductUrl} onKeyPress={handleKeyDownForProductUrl}>
                                    {product.name}
                                    {product.url && <i className="material-icons" aria-label="Assign Person">open_in_new</i>}
                                </div>
                                {!isReadOnly && (
                                    <div className={'productControlsContainer'}>
                                        <button
                                            data-testid={createDataTestId('addPersonToProductIcon', product.name)}
                                            className="addPersonIcon material-icons greyIcon clickableIcon"
                                            onClick={setCurrentModalToCreateAssignment}
                                            onKeyDown={(e): void => handleKeyDownForSetCurrentModalToCreateAssignment(e)}
                                        >
                                            <i className="material-icons" aria-label="Assign Person">person_add</i>
                                        </button>
                                        <button
                                            className="editIcon material-icons greyIcon clickableIcon"
                                            data-testid={createDataTestId('editProductIcon', product.name)}
                                            onClick={toggleEditMenu}
                                            onKeyUp={(e): void => listenKeyUp(e)}
                                        >
                                            <i className="material-icons" aria-label="Product Menu" id={generateIdName()}>more_vert</i>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <TagList />
                            {
                                isEditMenuOpen &&
                                <EditMenu idToPass={generateIdName()} menuOptionList={getMenuOptionList()}
                                    onClosed={toggleEditMenu}/>
                            }
                        </div>
                        {!isReadOnly && product.assignments.length === 0 && (
                            <div className="emptyProductText">
                                <div className="emptyProductTextHint">
                                    <p>Add a person by clicking Add Person icon above or drag them in.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <AssignmentCardList product={product} />
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
