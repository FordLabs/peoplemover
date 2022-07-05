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

import React, {RefObject, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {registerProductRefAction, unregisterProductRefAction} from '../Redux/Actions';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';
import ProductClient from './ProductClient';
import {ProductCardRefAndProductPair} from './ProductDnDHelper';
import {isUnassignedProduct, Product} from './Product';
import {GlobalStateProps} from '../Redux/Reducers';
import AssignmentCardList from '../Assignments/AssignmentCardList';
import moment from 'moment';
import {Space} from '../Space/Space';
import {createDataTestId} from '../Utils/ReactUtils';
import MatomoEvents from '../Matomo/MatomoEvents';
import {ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import AssignmentClient from '../Assignments/AssignmentClient';
import ConfirmationModal, {ConfirmationModalProps} from 'Modal/ConfirmationModal/ConfirmationModal';
import {JSX} from '@babel/types';
import {getAssignments, Person} from '../People/Person';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';

import './Product.scss';
import {ModalContentsState} from '../State/ModalContentsState';
import ProductForm from './ProductForm';
import AssignmentForm from '../Assignments/AssignmentForm';

export const PRODUCT_URL_CLICKED = 'productUrlClicked';

interface Props {
    product: Product;
    currentSpace: Space;
    registerProductRef(productRef: ProductCardRefAndProductPair): void;
    unregisterProductRef(productRef: ProductCardRefAndProductPair): void;
}

function ProductCard({
    product,
    currentSpace,
    registerProductRef,
    unregisterProductRef,
}: Props): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const { fetchProducts, products } = useFetchProducts();

    const [isEditMenuOpen, setIsEditMenuOpen] = useState<boolean>(false);
    const [modal, setModal] = useState<JSX.Element | null>(null);
    const productRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        registerProductRef({ref: productRef, product});

        return () => unregisterProductRef({ref: productRef, product});
    }, [product, registerProductRef, unregisterProductRef]);

    function toggleEditMenu(): void {
        setIsEditMenuOpen(!isEditMenuOpen);
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
        setModalContents({
            title: 'Edit Product',
            component: <ProductForm
                editing
                product={product}/>,
        });
    }

    async function showArchiveProductModalAndCloseEditMenu(): Promise<void> {
        toggleEditMenu();
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: archiveProduct,
            close: () => setModal(null),
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
        product.assignments.forEach(assignment => {
            AssignmentClient.createAssignmentForDate(assignmentEndDate, getRemainingAssignments(assignment.person), currentSpace, assignment.person);
        });
        const archivedProduct = {...product, endDate: productEndDate};
        ProductClient.editProduct(currentSpace, archivedProduct, true).then(fetchProducts);
    }

    const getRemainingAssignments = (person: Person): Array<ProductPlaceholderPair> => {
        return getAssignments(person, products)
            .filter(assignment => assignment.productId !== product.id)
            .map(assignment => {
                return {
                    productId: assignment.productId,
                    placeholder: assignment.placeholder || false,
                };
            });
    };

    const setCurrentModalToCreateAssignment = (): void => setModalContents({
        title: 'Assign a Person',
        component: <AssignmentForm initiallySelectedProduct={product}/>,
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
                                    <div data-testid="productName" className="productName">{product.name}</div>
                                }
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
                            {isEditMenuOpen && (
                                <EditMenu
                                    idToPass={generateIdName()}
                                    menuOptionList={getMenuOptionList()}
                                    onClosed={toggleEditMenu}/>
                            )}
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
});

const mapDispatchToProps = (dispatch: any) => ({
    registerProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(registerProductRefAction(productRef)),
    unregisterProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(unregisterProductRefAction(productRef)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductCard);
/* eslint-enable */
