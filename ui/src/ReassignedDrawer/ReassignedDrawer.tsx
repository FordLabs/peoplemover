/*
 * Copyright (c) 2020 Ford Motor Company
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
import {Person} from '../People/Person';
import {fetchProductsAction} from '../Redux/Actions';

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
        const reassignments = AssignmentClient.getReassignments(currentSpace.uuid!!, viewingDate).then( reassignmentResponse =>
            setReassignments(reassignmentResponse.data)
        );
    }, [products]);
    /* eslint-enable */

    const listOfHTMLReassignments: Array<JSX.Element> = reassignments.map((reassignment: Reassignment, index: number) => (
        mapsReassignments(reassignment, index)
    ));

    const containee: JSX.Element = <div className="reassignmentContainer" data-testid="reassignmentContainer">{listOfHTMLReassignments}</div>;

    return (
        <DrawerContainer drawerIcon="fas fa-user-check"
            testId="reassignmentDrawer"
            containerTitle="Reassigned"
            containee={containee}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}
            numberForCountBadge={reassignments.length}/>
    );

    function mapsReassignments(reassignment: Reassignment, index: number): JSX.Element {
        let oneWayReassignment: string | undefined;
        if (!reassignment.toProductName) {
            oneWayReassignment = `${reassignment.fromProductName} assignment cancelled`;
        } else if (!reassignment.fromProductName) {
            oneWayReassignment = `Assigned to ${reassignment.toProductName}`;
        }

        return  (
            <div key={index} className="reassignmentSection" data-testid="reassignmentSection">
                <div className="name">{reassignment.person.name}</div>
                <div className="additionalInfo role">{reassignment.person.spaceRole ? reassignment.person.spaceRole.name : ''}</div>
                {!oneWayReassignment &&
                    <div className="additionalInfo">{reassignment.fromProductName} <i className="fas fa-long-arrow-alt-right"/> {reassignment.toProductName}</div>
                }
                {oneWayReassignment &&
                    <div className="additionalInfo">{oneWayReassignment}</div>
                }
                <button className="revertButton" onClick={(): Promise<void> => revert(reassignment.person)}><i className="fas fa-undo-alt"/>Revert</button>
            </div>
        );
    }

    async function revert(person: Person): Promise<void> {
        await AssignmentClient.deleteAssignmentForDate(viewingDate, person).then(fetchProducts);
    }
}

const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    viewingDate: state.viewingDate,
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReassignedDrawer);
