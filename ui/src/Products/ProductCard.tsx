/*
 * Copyright (c) 2019 Ford Motor Company
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
import './Product.scss';
import {connect} from 'react-redux';
import {
    AvailableModals,
    fetchProductsAction,
    registerProductRefAction,
    setCurrentModalAction,
    setWhichEditMenuOpenAction,
    unregisterProductRefAction,
} from '../Redux/Actions';
import EditMenu, {EditMenuOption} from '../ReusableComponents/EditMenu';
import ProductClient from './ProductClient';
import {ProductCardRefAndProductPair} from './ProductDnDHelper';
import {EditMenuToOpen} from '../ReusableComponents/EditMenuToOpen';
import {Product} from './Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AxiosResponse} from 'axios';
import AssignmentCardList from '../Assignments/AssignmentCardList';
import moment from 'moment';

interface ProductCardProps {
    container: string;
    product: Product;

    registerProductRef(productRef: ProductCardRefAndProductPair): void;

    unregisterProductRef(productRef: ProductCardRefAndProductPair): void;

    viewingDate: Date;
    whichEditMenuOpen: EditMenuToOpen;

    setWhichEditMenuOpen(whichEditMenuOption: EditMenuToOpen | null): void;

    setCurrentModal(modalState: CurrentModalState): void;

    fetchProducts(): void;
}

function ProductCard({
    container,
    product,
    registerProductRef,
    unregisterProductRef,
    viewingDate,
    whichEditMenuOpen,
    setWhichEditMenuOpen,
    setCurrentModal,
    fetchProducts,
}: ProductCardProps): JSX.Element {

    const [editMenuIsOpened, setEditMenuIsOpened] = useState<boolean>(false);
    const productRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

    function onEditMenuClosed(): void {
        setEditMenuIsOpened(false);
    }

    /* eslint-disable */
    useEffect(() => {
        registerProductRef({ref: productRef, product});

        return () => {
            unregisterProductRef({ref: productRef, product});
        };
    }, []);
    /* eslint-enable */

    function toggleEditMenu(): void {
        if (ourEditMenuIsOpen()) {
            setWhichEditMenuOpen(null);
            setEditMenuIsOpened(false);
        } else {
            const editMenuOption: EditMenuToOpen = {
                id: product.id,
                type: 'product',
            };
            setWhichEditMenuOpen(editMenuOption);
            setEditMenuIsOpened(true);
        }
    }

    function ourEditMenuIsOpen(): boolean {
        return whichEditMenuOpen && whichEditMenuOpen.id === product.id && whichEditMenuOpen.type === 'product';
    }

    function getMenuOptionList(): Array<EditMenuOption> {
        return [
            {
                callback: editProductAndCloseEditMenu,
                text: 'Edit Product',
                icon: 'fa-pen',
            },
            {
                callback: archiveProductAndCloseEditMenu,
                text: 'Archive Product',
                icon: 'fa-inbox',
            },
        ];
    }

    function editProductAndCloseEditMenu(): void {
        toggleEditMenu();
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

    function archiveProduct(): Promise<AxiosResponse> {
        const archivedProduct = {...product, endDate: moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD')};
        return ProductClient.editProduct(archivedProduct);
    }

    return (
        <div className={container} data-testid={container} ref={productRef}>
            <div key={product.name}>
                {container === 'productCardContainer' && (
                    <div>
                        <div className="productNameEditContainer">
                            <div>
                                <h2 className="productName" data-testid="productName">
                                    {product.name}
                                </h2>
                                <p className="productTagContainer">
                                    <i>{product.spaceLocation && product.spaceLocation.name}</i>
                                    {product.spaceLocation && product.spaceLocation.name !== '' && product.productTags.length > 0 && <i>, </i>}
                                    {product.productTags.map((tag, index) => {
                                        if (index < product.productTags.length - 1) {
                                            return <i key={tag.id}>{tag.name}, </i>;
                                        }
                                        return <i key={tag.id}>{tag.name}</i>;
                                    })}
                                </p>
                            </div>
                            <div className="productControlsContainer">
                                <div className="addPersonIconContainer">
                                    <i data-testid={'addPersonToProductIcon-' + product.id}
                                        className="fas fa-user-plus fa-flip-horizontal fa-xs greyIcon clickableIcon"
                                        onClick={() => setCurrentModal({
                                            modal: AvailableModals.CREATE_ASSIGNMENT,
                                            item: product,
                                        })}/>
                                </div>
                                <div className="editIcon fas fa-ellipsis-v greyIcon clickableIcon"
                                    data-testid={'editProductIcon_' + product.id}
                                    onClick={toggleEditMenu}/>
                            </div>
                            {
                                editMenuIsOpened &&
                                <EditMenu menuOptionList={getMenuOptionList()}
                                    onClosed={onEditMenuClosed}/>
                            }
                        </div>
                        {product.assignments.length === 0 && (
                            <div className="emptyProductText">
                                <div className="emptyProductTextHint">
                                    <p>Add a person by clicking</p>
                                    <i className="fas fa-user-plus fa-flip-horizontal fa-xs greyIcon"/>
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

const mapStateToProps = (state: GlobalStateProps) => ({
    viewingDate: state.viewingDate,
    whichEditMenuOpen: state.whichEditMenuOpen,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
    setWhichEditMenuOpen: (menu: EditMenuToOpen) => dispatch(setWhichEditMenuOpenAction(menu)),
    registerProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(registerProductRefAction(productRef)),
    unregisterProductRef: (productRef: ProductCardRefAndProductPair) => dispatch(unregisterProductRefAction(productRef)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductCard);
