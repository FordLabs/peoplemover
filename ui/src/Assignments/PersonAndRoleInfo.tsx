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

import React, {ReactElement} from 'react';
import {Assignment} from './Assignment';
import './PersonAndRoleInfo.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {AvailableModals} from '../Modal/AvailableModals';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {setCurrentModalAction} from '../Redux/Actions';
import MatomoEvents from '../Matomo/MatomoEvents';
import {Space} from '../Space/Space';
import HoverableIcon from './HoverableIcon';

interface Props {
    assignment: Assignment;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;
    isDragging: boolean;
    timeOnProduct?: number;
    currentSpace: Space;

    setCurrentModal(modalState: CurrentModalState): void;
}

const PersonAndRoleInfo = ({
    isReadOnly,
    assignment = {id: 0} as Assignment,
    isUnassignedProduct,
    isDragging,
    timeOnProduct,
    setCurrentModal,
    currentSpace,
}: Props): ReactElement => {
    const {person} = assignment;

    const numberOfDaysString = (timeOnProject: number): string => {
        if (timeOnProject === 1) {
            return timeOnProject.toFixed(0).concat(' day');
        } else {
            return timeOnProject.toFixed(0).concat(' days');
        }
    };

    const openEditPersonModal = (): void => {
        if (timeOnProduct) {
            MatomoEvents.pushEvent(currentSpace.name, 'openEditPersonFromTimeOnProduct', timeOnProduct.toString());
        }
        setCurrentModal({
            modal: AvailableModals.EDIT_PERSON,
            item: assignment,
        });
    };

    const listOfTagName = (): string[] => {
        if (person.tags) {
            return person.tags.map((tag) => {
                return tag.name;
            });
        } else return [];
    };

    const passNote = (): []|string[] => {
        if (person.notes) {
            return [person.notes];
        } else {
            return [];
        }
    };

    return (
        <div data-testid={`assignmentCard${assignment.id}info`}
            className="personNameAndRoleContainer">
            <div
                className={`${person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} ${!isReadOnly ? 'notReadOnly' : ''}  personName`}
                data-testid="personName">
                {person.name}
                <HoverableIcon iconName={'note'} textToDisplay={passNote()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct}/>
                <HoverableIcon iconName={'style'} textToDisplay={listOfTagName()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct}/>
            </div>
            {person?.spaceRole?.name && (
                <div className={`${!isReadOnly ? 'notReadOnly' : ''}  personRole`}>
                    {person.spaceRole.name}
                </div>
            )}
            {timeOnProduct && !isReadOnly &&
            <button className="timeOnProductButton timeOnProduct" onClick={(): void => {
                openEditPersonModal();
            }}>
                {numberOfDaysString(timeOnProduct)}
            </button>
            }
            {timeOnProduct && isReadOnly && <span className="timeOnProduct">{numberOfDaysString(timeOnProduct)}</span>}
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isDragging: state.isDragging,
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState))
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonAndRoleInfo);
/* eslint-enable */
