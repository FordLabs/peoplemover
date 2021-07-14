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
import {Product} from '../Products/Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Assignment, calculateDuration} from '../Assignments/Assignment';
import {Space} from '../Space/Space';
import RedirectClient from '../Utils/RedirectClient';
import PersonAndRoleInfo from '../Assignments/PersonAndRoleInfo';
import './TimeOnProduct.scss';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {fetchProductsAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';

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

    const productNaming = (product: Product): string => {
        if (product.name === 'unassigned') {
            return 'unassigned persons:';
        } else {
            return product.name + ':';
        }

    };

    const ListOfAssignments = ({assignments}: ListOfAssignmentsProps): JSX.Element => {
        return (<>
            {assignments.map(assignment => {
                return (<div data-testid={assignment.id.toString()} key={assignment.id}>
                    <PersonAndRoleInfo assignment={assignment} isReadOnly={true} isUnassignedProduct={false} timeOnProduct={calculateDuration(assignment, viewingDate)} />
                </div>);
            })}
        </>);
    };

    const ListOfProducts = (): JSX.Element => {
        return (<>
            {products.map(product => {
                return (
                    <div data-testid={product.id} className="productContainer" key={product.id}>
                        <h3 className="productName"> {productNaming(product)} </h3>
                        <ListOfAssignments assignments={product.assignments}/>
                    </div>);
            })}
        </>);
    };

    return (

        currentSpace && <>
            <CurrentModal/>
            <div>
                <h2 className="title">Time On Product (in calendar days)</h2>
                <div className="date">As of: {viewingDate.toDateString()}</div>
                {currentSpace && currentSpace.name && <>
                    <ListOfProducts/>
                </>}
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
