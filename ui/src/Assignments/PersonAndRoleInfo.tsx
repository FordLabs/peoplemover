/*!
 * Copyright (c) 2019 Ford Motor Company
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

interface Props {
    assignment: Assignment;
    isUnassignedProduct: boolean;
}

const PersonAndRoleInfo = ({ assignment = {id: 0} as Assignment, isUnassignedProduct}: Props): ReactElement => {
    const [hoverBoxIsOpened, setHoverBoxIsOpened] = useState<boolean>(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout>();
    const showHoverBox = hoverBoxIsOpened && isUnassignedProduct;

    const HoverBox = ({notes}: {
        notes: string;
    }): JSX.Element  => {
        return (
            <div className="hoverBoxContainer"
                data-testid="hoverBoxContainer">
                <p className="hoverBoxNotes">{notes}</p>
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

    return (
        <div data-testid={`assignmentCard${assignment.id}info`}
            className="personNameAndRoleContainer">
            <div className={`${assignment.person.name === 'Chris Boyer' ? 'chrisBoyer' : ''} personName`}
                data-testid="personName"
                onMouseEnter={e => onNoteHover(true)}
                onMouseLeave={e => onNoteHover(false)}>
                {assignment.person.name}
                {!!assignment.person.notes &&
                    <div className="fas fa-file notesIcon" data-testid="notesIcon">
                        {showHoverBox && <HoverBox notes={assignment.person.notes}/>}
                    </div>
                }
            </div>
            <div className="personRole">
                {assignment.person.spaceRole && assignment.person.spaceRole.name}
            </div>
        </div>
    );
};

export default PersonAndRoleInfo;
