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

import {UNASSIGNED_PRODUCT_NAME} from 'Products/ProductService';
import {calculateDuration} from 'Services/AssignmentService';
import SubHeader from 'SubHeader/SubHeader';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';
import {ModalContentsState} from 'State/ModalContentsState';
import PersonForm from 'People/PersonForm/PersonForm';
import Modal from 'Modal/Modal';
import useFetchCurrentSpace from 'Hooks/useFetchCurrentSpace/useFetchCurrentSpace';
import {useParams} from 'react-router-dom';
import {Product} from 'Types/Product';
import {Assignment} from 'Types/Assignment';
import Branding from 'Common/Branding/Branding';

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
        const productName = product.name === UNASSIGNED_PRODUCT_NAME ? 'Unassigned' : product.name;
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

function TimeOnProduct(): JSX.Element {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();

    const [modalContents, setModalContents] = useRecoilState(ModalContentsState)
    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const { fetchProducts, products } = useFetchProducts(teamUUID);
    const { fetchCurrentSpace, currentSpace } = useFetchCurrentSpace(teamUUID);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!currentSpace.uuid) fetchCurrentSpace();
    }, [currentSpace, fetchCurrentSpace]);

    useEffect(() => {
        if (currentSpace && !modalContents) {
            setIsLoading(true);
            fetchProducts();
        }
    }, [modalContents, currentSpace, fetchProducts]);

    useEffect(() => {
        if (products.length) setIsLoading(false);
    }, [products]);

    const onNameClick = (timeOnProductItem: TimeOnProductItem): void => {
        const product = products.find(item => timeOnProductItem.productName.toLowerCase() === item.name.toLowerCase());
        const assignment = product?.assignments.find((item: Assignment) => timeOnProductItem.assignmentId === item.id);
        if (assignment) {
            setModalContents({
                title: 'Edit Person',
                component: <PersonForm
                    isEditPersonForm
                    personEdited={assignment.person}
                />,
            });
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
        currentSpace && (
            <div className="App">
                <Modal />
                <SubHeader
                    showFilters={false}
                    showSortBy={false}
                    message={
                        <div className="timeOnProductHeaderMessage">
                            <span className="newBadge" data-testid="newBadge">BETA</span>View People by Time On Product
                        </div>
                    }
                />
                {isLoading ?
                    <div className="timeOnProductLoading">{LOADING}</div>
                    : (
                        <div className="timeOnProductTable">
                            {convertToTable(generateTimeOnProductItems(products, viewingDate).sort(sortTimeOnProductItems))}
                        </div>
                    )
                }
                <footer>
                    <Branding/>
                </footer>
            </div>
        )
    );
}

export default TimeOnProduct;

