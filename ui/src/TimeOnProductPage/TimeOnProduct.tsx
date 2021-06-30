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
import {Assignment} from '../Assignments/Assignment';
import moment from 'moment';
import {Space} from '../Space/Space';
import RedirectClient from '../Utils/RedirectClient';

export interface ListOfAssignmentsProps {
    assignments: Array<Assignment>;
}

export interface TimeOnProductProps {
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;
}

function TimeOnProduct({
    currentSpace,
    viewingDate,
    products,
}: TimeOnProductProps): JSX.Element {

    useEffect( ()=> {
        const uuid = window.location.pathname.split('/')[1];
        if (!currentSpace) {
            RedirectClient.redirect(`/${uuid}`);
        }
    }, [currentSpace]);

    const calculateDuration = (assignment: Assignment): number => {
        if (assignment.startDate) {
            const viewingDateMoment = moment(viewingDate);
            const startingDateMoment = moment(assignment.startDate);
            return Math.floor(moment.duration(viewingDateMoment.diff(startingDateMoment)).asDays());
        } else {
            return -1;
        }
    };

    const ListOfAssignments = ({assignments}: ListOfAssignmentsProps): JSX.Element => {
        if (assignments.length === 0) {
            return (<div>+++ none</div>);
        }
        return (<>
            {assignments.map(assignment => {
                return (<div
                    key={assignment.id}>+++ {assignment.person.name} - {calculateDuration(assignment)} day(s)</div>);
            })}
        </>);
    };

    const ListOfProducts = (): JSX.Element => {
        return (<>
            {products.map(product => {
                return (
                    <div key={product.id}>+ Product Name: {product.name}
                        <div>++ Assignments:</div>
                        <ListOfAssignments assignments={product.assignments}/>
                    </div>);
            })}
        </>);
    };

    return (
        currentSpace && <div>Time On Product
            <div>- Current date: {viewingDate.toDateString()}</div>
            {currentSpace && currentSpace.name && <>
                <div>- Current Space: {currentSpace.name}</div>
                <ListOfProducts/>
            </>}
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    products: state.products,
});

export default connect(mapStateToProps)(TimeOnProduct);
/* eslint-enable */
