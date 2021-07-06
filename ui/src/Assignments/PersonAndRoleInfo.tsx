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

import React, {ReactElement, useState} from 'react';
import {Assignment} from './Assignment';
import './PersonAndRoleInfo.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {AvailableModals} from '../Modal/AvailableModals';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {setCurrentModalAction} from '../Redux/Actions';

interface Props {
    assignment: Assignment;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;
    isDragging: boolean;
    timeOnProject?: number;

    setCurrentModal(modalState: CurrentModalState): void;
}

const PersonAndRoleInfo = ({ isReadOnly, assignment = {id: 0} as Assignment, isUnassignedProduct, isDragging, timeOnProject, setCurrentModal }: Props): ReactElement => {
    const { person } = assignment;
    const [hoverBoxIsOpened, setHoverBoxIsOpened] = useState<boolean>(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout>();
    const HoverBox = ({notes}: {
        notes: string;
    }): JSX.Element  => {
        return (
            <div className={`hoverBoxContainer ${isUnassignedProduct ? 'unassignedHoverBoxContainer' : ''}`}
                data-testid="hoverBoxContainer">
                <p className="hoverBoxNotes">
                    {notes}
                </p>
            </div>
        );
    };

    const onNoteHover = (boxIsHovered = false): void => {
        if (boxIsHovered) {
            const timeout = setTimeout(() => {
                setHoverBoxIsOpened(boxIsHovered);
            }, 500);

            setHoverTimeout(timeout);
        } else {
            setHoverBoxIsOpened(boxIsHovered);
            if (hoverTimeout) clearTimeout(hoverTimeout);
        }
    };

    const numberOfDaysString = (timeOnProject: number): string => {
        if (timeOnProject === 1) {
            return timeOnProject.toString().concat(' day');
        } else {
            return timeOnProject.toString().concat(' days');
        }
    };

    const openModal = (): void => setCurrentModal({
        modal: AvailableModals.EDIT_PERSON,
        item: assignment,
    });

    const NotesIcon = (): ReactElement => {
        if (isReadOnly || !person.notes?.trim().length) {
            return <></>;
        }
        return  <i
            className={`material-icons notesIcon ${isUnassignedProduct ? 'unassignedNotesIcon' : ''}`}
            data-testid="notesIcon"
            onMouseEnter={(): void => onNoteHover(true)}
            onMouseLeave={(): void => onNoteHover(false)}
        >
            note
            {!isDragging && hoverBoxIsOpened && <HoverBox notes={person.notes}/>}
        </i>;

    };

    return (
        <div data-testid={`assignmentCard${assignment.id}info`}
            className="personNameAndRoleContainer">
            <div className={`${person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} ${!isReadOnly ? 'notReadOnly' : ''}  personName`}
                data-testid="personName">
                {person.name}
                <NotesIcon/>
            </div>
            {person?.spaceRole?.name && (
                <div className={`${!isReadOnly ? 'notReadOnly' : ''}  personRole`}>
                    {person.spaceRole.name}
                </div>
            )}
            {timeOnProject &&
            <button className="timeOnProject" onClick={(): void => {openModal()}}>
                {numberOfDaysString(timeOnProject)}
            </button>
            }
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isDragging: state.isDragging,
});

const mapDispatchToProps = (dispatch: any) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState))
});

export default connect(mapStateToProps, mapDispatchToProps) (PersonAndRoleInfo);
/* eslint-enable */
