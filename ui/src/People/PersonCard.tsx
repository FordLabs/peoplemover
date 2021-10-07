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

import React from 'react';
import NewBadge from '../ReusableComponents/NewBadge';
import {connect} from 'react-redux';
import {setCurrentModalAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import '../Application/Styleguide/Main.scss';
import {createDataTestId} from '../tests/TestUtils';
import {AvailableModals} from '../Modal/AvailableModals';
import {Person} from './Person';
import PersonAndRoleInfo from '../Assignments/PersonAndRoleInfo';

interface PersonCardProps {
    viewingDate: Date;
    isReadOnly: boolean;
    person: Person;

    setCurrentModal(modalState: CurrentModalState): void;
}

function PersonCard({
    viewingDate,
    isReadOnly,
    person,
    setCurrentModal,
}: PersonCardProps): JSX.Element {

    function toggleModal(): void {
        if (!isReadOnly) {
            const newModalState: CurrentModalState = {
                modal: AvailableModals.EDIT_PERSON,
                item: person,
            };
            setCurrentModal(newModalState);
        }
    }

    function handleKeyPress(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            toggleModal();
        }
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
            <div onClick={toggleModal} onKeyPress={handleKeyPress} data-testid={createDataTestId('archivedPersonContainer', person.name)}>
                <PersonAndRoleInfo
                    person={person}
                    duration={NaN}
                    isUnassignedProduct={true}
                />
            </div>
            <button
                className="personRoleColor"
                aria-label="Person Menu"
                disabled={isReadOnly}
                style={{backgroundColor: cssRoleColor}}
                data-testid={createDataTestId('archivedPersonIconContainer', person.name)}
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
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonCard);
/* eslint-enable */
