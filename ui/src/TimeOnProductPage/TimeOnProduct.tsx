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
// import PersonAndRoleInfo from '../Assignments/PersonAndRoleInfo';
import './TimeOnProduct.scss';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {fetchProductsAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import HeaderContainer from '../Header/HeaderContainer';
import SubHeader from '../Header/SubHeader';

export interface TimeOnProductItem {
    personName: string;
    productName: string;
    personRole: string;
    timeOnProduct: number;
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

    fetchProducts(): Array<Product>;
}

function TimeOnProduct({currentSpace, viewingDate, products, currentModal, fetchProducts}: TimeOnProductProps): JSX.Element {

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

    // const productNaming = (product: Product): string => {
    //     if (product.name === UNASSIGNED) {
    //         return 'unassigned persons:';
    //     } else {
    //         return product.name + ':';
    //     }
    //
    // };

    // const ListOfAssignments = ({assignments}: ListOfAssignmentsProps): JSX.Element => {
    //     return (<>
    //         {assignments.map(assignment => {
    //             return (<div data-testid={assignment.id.toString()} key={assignment.id}>
    //                 <PersonAndRoleInfo assignment={assignment} isUnassignedProduct={false} timeOnProduct={calculateDuration(assignment, viewingDate)} />
    //             </div>);
    //         })}
    //     </>);
    // };

    // const ListOfProducts = (): JSX.Element => {
    //     return (<>
    //         {products.map(product => {
    //             return (
    //                 <div data-testid={product.id} className="productContainer" key={product.id}>
    //                     <h3 className="productName"> {productNaming(product)} </h3>
    //                     <ListOfAssignments assignments={product.assignments}/>
    //                 </div>);
    //         })}
    //     </>);
    // };

    const convertToRow = (timeOnProductItem: TimeOnProductItem): JSX.Element => {
        return (
            <div className="timeOnProductRow">
                <div className="timeOnProductCell">{timeOnProductItem.personName}</div>
                <div className="timeOnProductCell">{timeOnProductItem.productName}</div>
                <div className="timeOnProductCell">{timeOnProductItem.personRole}</div>
                <div className="timeOnProductCell">{timeOnProductItem.timeOnProduct} days</div>
            </div>
        );
    };

    const convertToTable = (timeOnProductItems: TimeOnProductItem[]): JSX.Element => {
        return (
            <div>
                <div className="timeOnProductRow timeOnProductHeader">
                    <div className="timeOnProductCell">Name</div>
                    <div className="timeOnProductCell">Product</div>
                    <div className="timeOnProductCell">Role</div>
                    <div className="timeOnProductCell">Days On Product</div>
                </div>
                {timeOnProductItems.map(timeOnProductItem => {
                    return convertToRow(timeOnProductItem);
                })}
            </div>
        );
    };

    return (
        currentSpace && <>
            <CurrentModal/>
            {/*<div>*/}
            {/*    <h2 className="title">Time On Product (in calendar days)</h2>*/}
            {/*    <div className="date">As of: {viewingDate.toDateString()}</div>*/}
            {/*    {currentSpace && currentSpace.name && <>*/}
            {/*        <ListOfProducts/>*/}
            {/*    </>}*/}
            {/*</div>*/}
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
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(TimeOnProduct);
/* eslint-enable */
