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

import React, {useEffect} from 'react';
import {Product, UNASSIGNED} from '../Products/Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {calculateDuration} from '../Assignments/Assignment';
import {Space} from '../Space/Space';
import RedirectClient from '../Utils/RedirectClient';
import './TimeOnProduct.scss';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {fetchProductsAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import HeaderContainer from '../Header/HeaderContainer';
import SubHeader from '../Header/SubHeader';
import {AvailableModals} from '../Modal/AvailableModals';

export interface TimeOnProductItem {
    personName: string;
    productName: string;
    personRole: string;
    timeOnProduct: number;
    assignmentId: number;
    personId: number;
}

export const generateTimeOnProductItems = (products: Product[], viewingDate: Date): TimeOnProductItem[] => {
    const timeOnProductItem: TimeOnProductItem[] = [];
    products.forEach(product => {
        const productName = product.name === UNASSIGNED ? 'Unassigned' : product.name;
        product.assignments.forEach(assignment => {
            timeOnProductItem.push({
                personName: assignment.person.name,
                productName: productName,
                personRole: assignment.person.spaceRole?.name || 'No Role Assigned',
                timeOnProduct: calculateDuration(assignment, viewingDate),
                assignmentId: assignment.id,
                personId: assignment.person.id,
            });
        });
    });
    return timeOnProductItem;
};

export const sortTimeOnProductItems = (a: TimeOnProductItem, b: TimeOnProductItem): number => {
    let returnValue = a.personName.localeCompare(b.personName);
    if (returnValue === 0) {
        returnValue = a.productName.localeCompare(b.productName);
        if (returnValue === 0) {
            returnValue = a.personRole.localeCompare(b.personRole);
            if (returnValue === 0) {
                returnValue = b.timeOnProduct - a.timeOnProduct;
            }
        }
    }
    return returnValue;
};

export interface TimeOnProductProps {
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;
    currentModal: CurrentModalState;

    fetchProducts(): Array<Product>;
    setCurrentModal(modalState: CurrentModalState): void;
}

function TimeOnProduct({currentSpace, viewingDate, products, currentModal, fetchProducts, setCurrentModal}: TimeOnProductProps): JSX.Element {

    const extractUuidFromUrl = (): string => {
        return window.location.pathname.split('/')[1];
    };

    useEffect(() => {
        if (!currentSpace) {
            const uuid = extractUuidFromUrl();
            RedirectClient.redirect(`/${uuid}`);
        }
    }, [currentSpace]);

    useEffect(() => {
        if (currentSpace && currentModal.modal === null) {
            fetchProducts();
        }
    }, [currentModal, currentSpace, fetchProducts]);

    const onNameClick = (timeOnProductItem: TimeOnProductItem): void => {
        const product = products.find(item => timeOnProductItem.productName === item.name);
        const assignment = product?.assignments.find(item => timeOnProductItem.assignmentId === item.id);
        if (assignment) {
            const newModalState: CurrentModalState = {
                modal: AvailableModals.EDIT_PERSON,
                item: assignment.person,
            };
            setCurrentModal(newModalState);
        }
    };

    const convertToRow = (timeOnProductItem: TimeOnProductItem): JSX.Element => {
        const unit = (timeOnProductItem.timeOnProduct > 1 ? 'days' : 'day');
        return (
            <div className="timeOnProductRow"
                data-testid={timeOnProductItem.assignmentId.toString()}
                key={timeOnProductItem.assignmentId.toString()}
            >
                <button className="timeOnProductCell timeOnProductCellName"
                    onClick={(): void => {onNameClick(timeOnProductItem);}}
                >
                    {timeOnProductItem.personName}
                </button>
                <div className="timeOnProductCell">{timeOnProductItem.productName}</div>
                <div className="timeOnProductCell">{timeOnProductItem.personRole}</div>
                <div className="timeOnProductCell">{timeOnProductItem.timeOnProduct} {unit}</div>
            </div>
        );
    };

    const convertToTable = (timeOnProductItems: TimeOnProductItem[]): JSX.Element => {
        return (
            <>
                <div className="timeOnProductHeader">
                    <div className="timeOnProductHeaderCell timeOnProductHeaderName">Name</div>
                    <div className="timeOnProductHeaderCell">Product</div>
                    <div className="timeOnProductHeaderCell">Role</div>
                    <div className="timeOnProductHeaderCell">Days On Product</div>
                </div>
                {timeOnProductItems.map(timeOnProductItem => {
                    return convertToRow(timeOnProductItem);
                })}
            </>
        );
    };

    return (
        currentSpace && <>
            <CurrentModal/>
            <div className="App">
                <HeaderContainer>
                    <SubHeader showFilters={false} showSortBy={false} message={<div className="timeOnProductHeaderMessage"><span className="newBadge" data-testid="newBadge">BETA</span>View People by Time On Product</div>}/>
                </HeaderContainer>
                <div className="timeOnProductTable">
                    {convertToTable(generateTimeOnProductItems(products, viewingDate).sort(sortTimeOnProductItems))}
                </div>
            </div>
        </>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    products: state.products,
    currentModal: state.currentModal,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeOnProduct);
/* eslint-enable */
