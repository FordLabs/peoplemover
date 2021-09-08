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
import {Assignment, calculateDuration} from './Assignment';
import './PersonAndRoleInfo.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import HoverableIcon from './HoverableIcon';

interface HoverInfo {
    title: string;
    text: string;
    icon: string;
}

interface Props {
    assignment: Assignment;
    isUnassignedProduct: boolean;
    isReadOnly: boolean;
    isDragging: boolean;
    viewingDate: Date;
}

const PersonAndRoleInfo = ({
    isReadOnly,
    assignment = {id: 0} as Assignment,
    isUnassignedProduct,
    isDragging,
    viewingDate,
}: Props): ReactElement => {
    const {person} = assignment;

    const [hoverBoxIsOpened, setHoverBoxIsOpened] = useState<boolean>(false);

    const onHover = (boxIsHovered = false): void => {
        setHoverBoxIsOpened(boxIsHovered);
    };

    const getDisplayContent = (): HoverInfo[] => {
        const toReturn: HoverInfo[] = [];
        toReturn.push({
            title: 'Time on Product',
            text: numberOfDaysString(calculateDuration(assignment, viewingDate)),
            icon: 'timer',
        });
        if (person.tags.length > 0) {
            toReturn.push({
                title: 'Person Tags',
                text: listOfTagName().join(', '),
                icon: 'local_offer',
            });
        }
        if (assignment.person.notes !== undefined && assignment.person.notes !== '') {
            toReturn.push({
                title: 'Notes',
                text: assignment.person.notes,
                icon: 'note',
            });
        }
        return toReturn;
    };

    const HoverBox = (): JSX.Element => {
        const content = getDisplayContent();
        return (
            <div className={`hoverBoxContainer ${isUnassignedProduct ? 'unassignedHoverBoxContainer' : ''}`}>
                {content.map(hoverInfo => {
                    return (<div key={hoverInfo.title}><p className="hoverBoxTitle">{hoverInfo.title}:</p>
                        <p className="hoverBoxText">
                            {hoverInfo.text}
                        </p></div>);
                })}
            </div>
        );
    };

    const numberOfDaysString = (timeOnProject: number): string => {
        if (timeOnProject === 1) {
            return timeOnProject.toFixed(0).concat(' Day');
        } else {
            return timeOnProject.toFixed(0).concat(' Days');
        }
    };

    const listOfTagName = (): string[] => {
        if (person.tags) {
            return person.tags.map((tag) => {
                return tag.name;
            });
        } else return [];
    };

    const passNote = (): [] | string[] => {
        if (person.notes) {
            return [person.notes];
        } else {
            return [];
        }
    };

    return (
        <div data-testid={`assignmentCard${assignment.id}info`}
            className="personNameAndRoleContainer"
            onMouseEnter={(): void => onHover(true)}
            onMouseLeave={(): void => onHover(false)}
        >
            <div
                className={`${person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} ${!isReadOnly ? 'notReadOnly' : ''}  personName`}
                data-testid="personName">
                {person.name}
                <HoverableIcon iconName={'local_offer'} textToDisplay={listOfTagName()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct} type={'Person Tags'}/>
                <HoverableIcon iconName={'note'} textToDisplay={passNote()} viewOnly={isReadOnly}
                    isDragging={isDragging} isUnassignedProduct={isUnassignedProduct} type={'Notes'}/>
            </div>
            {person?.spaceRole?.name && (
                <div className={`${!isReadOnly ? 'notReadOnly' : ''}  personRole`}>
                    {person.spaceRole.name}
                </div>
            )}
            {!isDragging && !isReadOnly && hoverBoxIsOpened && <HoverBox/>}
        </div>
    );
};

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isDragging: state.isDragging,
    viewingDate: state.viewingDate,
    isReadOnly: state.isReadOnly
});

export default connect(mapStateToProps)(PersonAndRoleInfo);
/* eslint-enable */
