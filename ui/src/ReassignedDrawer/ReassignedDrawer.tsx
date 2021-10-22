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

import React, {useEffect, useState} from 'react';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import './ReassignedDrawer.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Reassignment} from './Reassignment';
import {Product} from '../Products/Product';
import AssignmentClient from '../Assignments/AssignmentClient';
import {Space} from '../Space/Space';
import {isArchived, Person} from '../People/Person';
import {fetchProductsAction} from '../Redux/Actions';
import MatomoEvents from '../Matomo/MatomoEvents';
import PeopleClient from '../People/PeopleClient';

interface ReassignedDrawerProps {
    products: Array<Product>;
    viewingDate: Date;
    currentSpace: Space;

    fetchProducts(): Array<Product>;
}

function ReassignedDrawer({
    products,
    viewingDate,
    currentSpace,
    fetchProducts,
}: ReassignedDrawerProps): JSX.Element {
    const [showDrawer, setShowDrawer] = useState(true);
    const [reassignments, setReassignments] = useState<Array<Reassignment>>([]);

    /* eslint-disable */
    useEffect(() => {
        AssignmentClient.getReassignments(currentSpace.uuid!, viewingDate)
            .then( reassignmentResponse =>
                setReassignments(reassignmentResponse.data)
            );
    }, [products]);
    /* eslint-enable */

    const listOfHTMLReassignments: Array<JSX.Element> = reassignments.map((reassignment: Reassignment, index: number) => (
        mapsReassignments(reassignment, index)
    ));

    const containee: JSX.Element = (
        <div
            className="reassignmentContainer"
            data-testid="reassignmentContainer">
            {listOfHTMLReassignments}
        </div>
    );

    return (
        <DrawerContainer
            drawerIcon="how_to_reg"
            testId="reassignmentDrawer"
            containerTitle="Reassigned"
            containee={containee}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}
            numberForCountBadge={reassignments.length}/>
    );

    function mapsReassignments(reassignment: Reassignment, index: number): JSX.Element {
        let oneWayReassignment: string | undefined;
        if (!reassignment.destinationProductName) {
            oneWayReassignment = `${reassignment.originProductName} assignment cancelled`;
        } else if (!reassignment.originProductName) {
            oneWayReassignment = `Assigned to ${reassignment.destinationProductName}`;
        }
        let toProductName = reassignment.destinationProductName;
        if (isArchived(reassignment.person, viewingDate)) {
            toProductName = 'archived';
        }

        return  (
            <div key={index} className="reassignmentSection" data-testid="reassignmentSection">
                <div className="name">{reassignment.person.name}</div>
                <div className="additionalInfo role">{reassignment.person.spaceRole ? reassignment.person.spaceRole.name : ''}</div>
                {!oneWayReassignment &&
                    <div className="additionalInfo">{reassignment.originProductName}
                        <i className="material-icons">east</i>
                        {toProductName}
                    </div>
                }
                {oneWayReassignment &&
                    <div className="additionalInfo">{oneWayReassignment}</div>
                }
                <button className="revertButton" onClick={(): Promise<void> => revert(reassignment.person)}>
                    <i className="material-icons" aria-hidden>undo</i>
                    Revert
                </button>
            </div>
        );
    }

    async function revert(person: Person): Promise<void> {
        const reassignment = reassignments.find(reassignment => reassignment.person.id === person.id);
        if (isArchived(person, viewingDate)) {
            PeopleClient.updatePerson(currentSpace, {...person, archiveDate: undefined}, []);
        }
        await AssignmentClient.deleteAssignmentForDate(viewingDate, person)
            .then(() => {
                fetchProducts();
                MatomoEvents.pushEvent(currentSpace.name, 'revert', `From: ${reassignment?.originProductName} To: ${reassignment?.destinationProductName}`);
            }).catch(err => {
                MatomoEvents.pushEvent(currentSpace.name, 'revertError', `From: ${reassignment?.originProductName} To: ${reassignment?.destinationProductName}`, err.code);
                return Promise.reject(err);
            });
    }
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    viewingDate: state.viewingDate,
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReassignedDrawer);
/* eslint-enable */
