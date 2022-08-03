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

import React, {ReactElement, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {isArchived} from 'People/PersonService';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import {IsDraggingState} from 'State/IsDraggingState';
import {Person} from 'Types/Person';

import './PersonAndRoleInfo.scss';

interface HoverInfo {
    title: string;
    text: string;
    icon: string;
}

interface Props {
    isUnassignedProduct: boolean;
    person: Person;
    duration: number;
}

const PersonAndRoleInfo = ({ isUnassignedProduct, duration, person }: Props): ReactElement => {
    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const isDragging = useRecoilValue(IsDraggingState);

    const [isHoverBoxOpen, setHoverBoxIsOpened] = useState<boolean>(false);

    const onHover = (boxIsHovered = false): void => {
        setHoverBoxIsOpened(boxIsHovered);
    };

    const hasNotes = (person: Person): boolean => {
        return person.notes !== undefined && person.notes !== '';
    };

    const hasTags = (person: Person): boolean => {
        return person.tags && person.tags.length > 0;
    };

    const getDisplayContent = (): HoverInfo[] => {
        const toReturn: HoverInfo[] = [];
        toReturn.push({
            title: 'Time on Product',
            text: numberOfDaysString(duration),
            icon: 'timer',
        });
        if (hasTags(person)) {
            toReturn.push({
                title: 'Person Tags',
                text: listOfTagName().join(', '),
                icon: 'local_offer',
            });
        }
        if (hasNotes(person)) {
            toReturn.push({
                title: 'Notes',
                text: person.notes || '',
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
                    return (
                        <div key={hoverInfo.title} className="flex-row">
                            <i className="material-icons tooltip-icon"
                                data-testid={hoverInfo.icon + '-icon'}>
                                {hoverInfo.icon}
                            </i>
                            <div className="flex-col">
                                <div className="hoverBoxTitle">{hoverInfo.title}:</div>
                                <div className="hoverBoxText">
                                    {hoverInfo.text}
                                </div>
                            </div>
                        </div>
                    );
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

    return (
        <div data-testid={`assignmentCardPersonInfo`}
            className="personNameAndRoleContainer"
            onMouseEnter={(): void => onHover(true)}
            onMouseLeave={(): void => onHover(false)}
        >
            <div
                className={`${!isReadOnly ? 'notReadOnly' : ''}  personName`}
                data-testid="personName">
                {person.name}
                {hasTags(person) && !isReadOnly && !isArchived(person, viewingDate) && <i className={'material-icons'}>local_offer</i>}
                {hasNotes(person) && !isReadOnly && !isArchived(person, viewingDate) && <i className={'material-icons'}>note</i>}
            </div>
            {person?.spaceRole?.name && (
                <div className={`${!isReadOnly ? 'notReadOnly' : ''}  personRole`}>
                    {person.spaceRole.name}
                </div>
            )}
            {!isDragging && !isReadOnly && !isUnassignedProduct && !isArchived(person, viewingDate) && isHoverBoxOpen && <HoverBox/>}
        </div>
    );
};

export default PersonAndRoleInfo;
