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
import {useRecoilValue} from 'recoil';
import DrawerContainer from 'Common/DrawerContainer/DrawerContainer';
import AssignmentClient from 'Services/Api/AssignmentClient';
import {isArchived} from 'Services/PersonService';
import PeopleClient from 'Services/Api/PeopleClient';
import {ViewingDateState} from 'State/ViewingDateState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';
import useFetchPeople from 'Hooks/useFetchPeople/useFetchPeople';
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from 'State/CurrentSpaceState';
import {Person} from 'Types/Person';

import './ReassignedDrawer.scss';

interface Reassignment {
    person: Person;
    originProductName?: string;
    destinationProductName: string;
}

function ReassignedDrawer(): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const { fetchProducts, products } = useFetchProducts(uuid);
    const { fetchPeople } = useFetchPeople(uuid);

    const [showDrawer, setShowDrawer] = useState(true);
    const [reassignments, setReassignments] = useState<Reassignment[]>([]);

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

    return (
        <DrawerContainer
            drawerIcon="how_to_reg"
            testId="reassignmentDrawer"
            containerTitle="Reassigned"
            containee={(
                <div
                    className="reassignmentContainer"
                    data-testid="reassignmentContainer">
                    {listOfHTMLReassignments}
                </div>
            )}
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
        if (isArchived(person, viewingDate)) {
            PeopleClient.updatePerson(currentSpace, {...person, archiveDate: undefined});
        }
        await AssignmentClient.deleteAssignmentForDate(viewingDate, person)
            .then(() => {
                fetchProducts();
                fetchPeople();
            });
    }
}

export default ReassignedDrawer;
