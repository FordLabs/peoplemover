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

import React, {useEffect, useState} from 'react';
import {Product, UNASSIGNED} from '../Products/Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {calculateDuration} from '../Assignments/Assignment';
import {Space} from '../Space/Space';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import HeaderContainer from '../Header/HeaderContainer';
import SubHeader from '../Header/SubHeader';
import {AvailableModals} from '../Modal/AvailableModals';
import {useRecoilValue} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';
import {useNavigate, useParams} from 'react-router-dom';

import './TimeOnProduct.scss';

export const LOADING = 'Loading...';

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
    let returnValue = b.timeOnProduct - a.timeOnProduct;
    if (returnValue === 0) {
        returnValue = a.personName.localeCompare(b.personName);
        if (returnValue === 0) {
            returnValue = a.productName.localeCompare(b.productName);
            if (returnValue === 0) {
                returnValue = a.personRole.localeCompare(b.personRole);
            }
        }
    }
    return returnValue;
};

export interface TimeOnProductProps {
    currentSpace: Space;
    currentModal: CurrentModalState;
    setCurrentModal(modalState: CurrentModalState): void;
}

function TimeOnProduct({currentSpace, currentModal, setCurrentModal}: TimeOnProductProps): JSX.Element {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const navigate = useNavigate();

    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const { fetchProducts, products } = useFetchProducts();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // @todo fetch space if no space is present
        if (!currentSpace) navigate(`/${teamUUID}`);
    }, [currentSpace, navigate, teamUUID]);

    useEffect(() => {
        if (currentSpace && currentModal.modal === null) {
            setIsLoading(true);
            fetchProducts();
        }
    }, [currentModal, currentSpace, fetchProducts]);

    useEffect(() => {
        if (products.length) setIsLoading(false);
    }, [products]);

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

    const getPersonNameClassName = (): string => {
        let className = 'timeOnProductCell';
        className += (isReadOnly ? ' timeOnProductCellNameDisabled' : ' timeOnProductCellName');
        return className;
    };

    const convertToRow = (timeOnProductItem: TimeOnProductItem): JSX.Element => {
        const unit = (timeOnProductItem.timeOnProduct > 1 ? 'days' : 'day');
        return (
            <div className="timeOnProductRow"
                data-testid={timeOnProductItem.assignmentId.toString()}
                key={timeOnProductItem.assignmentId.toString()}
            >
                <button className={getPersonNameClassName()}
                    onClick={(): void => {onNameClick(timeOnProductItem);}}
                    disabled={isReadOnly}
                >
                    {timeOnProductItem.personName}
                </button>
                <div className="timeOnProductCell">{timeOnProductItem.productName}</div>
                <div className="timeOnProductCell">{timeOnProductItem.personRole}</div>
                <div className="timeOnProductCell timeOnProductCellDays">{timeOnProductItem.timeOnProduct} {unit}</div>
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
                    <div className="timeOnProductHeaderCell timeOnProductHeaderCellDays">Days On Product<i className="material-icons timeOnProductSortIcon">sort</i></div>
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
                {isLoading ?
                    <div className="timeOnProductLoading">{LOADING}</div>
                    : <div className="timeOnProductTable">
                        {convertToTable(generateTimeOnProductItems(products, viewingDate).sort(sortTimeOnProductItems))}
                    </div>}
            </div>
        </>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    currentModal: state.currentModal,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeOnProduct);
/* eslint-enable */
