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
import AssignmentCardList from '../Assignments/AssignmentCardList';
import moment from 'moment';
import {Space} from '../Space/Space';
import {createDataTestId} from '../tests/TestUtils';

import './Product.scss';
import {AvailableModals} from '../Modal/AvailableModals';
import MatomoEvents from '../Matomo/MatomoEvents';
import {ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import AssignmentClient from '../Assignments/AssignmentClient';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {JSX} from '@babel/types';

export const PRODUCT_URL_CLICKED = 'productUrlClicked';

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
    const [modal, setModal] = useState<JSX.Element | null>(null);
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
                callback: showArchiveProductModalAndCloseEditMenu,
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

    async function showArchiveProductModalAndCloseEditMenu(): Promise<void> {
        toggleEditMenu();
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: archiveProduct,
            close: () => {
                setModal(null);
            },
            secondaryButton: undefined,
            content: (
                <>
                    <div>Archiving this product will move any people assigned to this product to Unassigned (unless they have already been assigned to another product).</div>

                    <div><br/>You can access these people from the Unassigned drawer.</div>
                </>
            ),
            submitButtonLabel: 'Archive',
        };
        setModal(ConfirmationModal(propsForDeleteConfirmationModal));
    }

    function archiveProduct(): void {
        if (!currentSpace.uuid) {
            console.error('No current space uuid');
            return;
        }
        const assignmentEndDate = moment(viewingDate).format('YYYY-MM-DD');
        const productEndDate = moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD');
        const unassignment: Array<ProductPlaceholderPair> = [];
        product.assignments.forEach(assignment => {
            AssignmentClient.createAssignmentForDate(assignmentEndDate, unassignment, currentSpace, assignment.person);
        });
        const archivedProduct = {...product, endDate: productEndDate};
        ProductClient.editProduct(currentSpace, archivedProduct, true).then(fetchProducts);
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
        handleMatomoEventsForProductUrlClicked();
        window.open(product.url);
    }

    function handleKeyDownForProductUrl(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            handleClickForProductUrl();
        }
    }

    const handleMatomoEventsForProductUrlClicked = (): void  => {
        MatomoEvents.pushEvent(currentSpace.name, PRODUCT_URL_CLICKED, product.name);
    };

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
        <div className={classNameAndDataTestId} data-testid={createDataTestId(classNameAndDataTestId, product.name)}
            ref={productRef}>
            <div key={product.name}>
                {!isUnassignedProduct(product) && (
                    <div>
                        <div className="productNameEditContainer">
                            <div className="productDetails">
                                {product.url ?
                                    <button className="productNameButton" onClick={handleClickForProductUrl}
                                        onKeyPress={handleKeyDownForProductUrl}>
                                        <div data-testid="productName" className="productName productNameUrl">
                                            {product.name}<i className="material-icons productUrlIcon productNameUrl"
                                                aria-label="Assign Person"
                                                data-testid="productUrl">open_in_new</i>
                                        </div>
                                    </button> :
                                    <div data-testid="productName" className="productName">{product.name}</div>}
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
                                            <i className="material-icons" aria-label="Product Menu"
                                                id={generateIdName()}>more_vert</i>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <TagList/>
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
                <AssignmentCardList product={product}/>
            </div>
            {modal}
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
