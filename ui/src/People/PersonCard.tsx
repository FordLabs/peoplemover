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

import React, {RefObject} from 'react';
import EditMenu from '../ReusableComponents/EditMenu';

import NewBadge from '../ReusableComponents/NewBadge';
import {connect} from 'react-redux';
import {setCurrentModalAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import '../Application/Styleguide/Main.scss';
import {createDataTestId} from '../tests/TestUtils';
import {Space} from '../Space/Space';
import {AvailableModals} from '../Modal/AvailableModals';
import {Person} from "./Person";
import PersonAndRoleInfo from "../Assignments/PersonAndRoleInfo";

interface PersonCardProps {
    currentSpace: Space;
    viewingDate: Date;
    isReadOnly: boolean;
    person: Person;

    setCurrentModal(modalState: CurrentModalState): void;
}

function PersonCard({
                        currentSpace,
                        viewingDate,
                        isReadOnly,
                        person,
                        setCurrentModal,
                    }: PersonCardProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;

    function toggleModal(): void {
        const newModalState: CurrentModalState = {
            modal: AvailableModals.EDIT_PERSON,
            item: person,
        };
        setCurrentModal(newModalState);
    }

    const cssRoleColor = person.spaceRole?.color?.color ? person.spaceRole.color.color : 'transparent';

    return (
        <div
            className={'archivedPersonCard'}
            data-testid={createDataTestId('archivedPersonCard', person.name)}
        >
            {person.newPerson && person.newPersonDate &&
            <div className="newPersonBadge"><NewBadge newPersonDate={person.newPersonDate}
                                                      viewingDate={viewingDate}/></div>}
                                                      <div onClick={toggleModal} data-testid={createDataTestId('editPersonIconContainer', person.name)}>
            <PersonAndRoleInfo
                person={person}
                duration={NaN}
                isUnassignedProduct={false}/>
                                                      </div>
            <button
                className="personRoleColor"
                aria-label="Person Menu"
                disabled={isReadOnly}
                style={{backgroundColor: cssRoleColor}}
                data-testid={createDataTestId('editPersonIconContainer', person.name)}
                onClick={toggleModal}
            >
                {!isReadOnly &&
                <i className="material-icons personEditIcon greyIcon" aria-hidden>
                    more_vert
                </i>
                }
            </button>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonCard);
/* eslint-enable */
