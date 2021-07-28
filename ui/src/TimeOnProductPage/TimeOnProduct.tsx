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
import {Assignment, calculateDuration} from '../Assignments/Assignment';
import {Space} from '../Space/Space';
import RedirectClient from '../Utils/RedirectClient';
import './TimeOnProduct.scss';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {fetchProductsAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import HeaderContainer from '../Header/HeaderContainer';
import SubHeader from '../Header/SubHeader';
import {Person} from '../People/Person';
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
    products.map(product => {
        const productName = product.name === UNASSIGNED ? 'Unassigned' : product.name;
        return product.assignments.map(assignment => {
            return timeOnProductItem.push({
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

export interface ListOfAssignmentsProps {
    assignments: Array<Assignment>;
}

export interface TimeOnProductProps {
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;
    currentModal: CurrentModalState;
    people: Array<Person>;

    fetchProducts(): Array<Product>;
    setCurrentModal(modalState: CurrentModalState): void;
}

function TimeOnProduct({currentSpace, viewingDate, products, currentModal, people, fetchProducts, setCurrentModal}: TimeOnProductProps): JSX.Element {

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
        const product = products.find(product => timeOnProductItem.productName === product.name);
        const assignment = product?.assignments.find(assignment => timeOnProductItem.assignmentId === assignment.id);
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
                <div className="timeOnProductRow timeOnProductHeader">
                    <div className="timeOnProductCell">Name</div>
                    <div className="timeOnProductCell">Product</div>
                    <div className="timeOnProductCell">Role</div>
                    <div className="timeOnProductCell">Days On Product</div>
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
                    <SubHeader/>
                </HeaderContainer>
                <div className="timeOnProductTable">
                    {convertToTable(generateTimeOnProductItems(products, viewingDate))}
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
    people: state.people,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchProducts: () => dispatch(fetchProductsAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeOnProduct);
/* eslint-enable */
