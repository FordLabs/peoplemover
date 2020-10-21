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

import React, {useState} from 'react';
import MyTraits from '../Traits/MyTraits';
import RoleClient from './RoleClient';
import warningIcon from '../Application/Assets/warningIcon.svg';

import '../Traits/MyTraits.scss';
import {Tag} from '../Tags/Tag';
import EditTagRow from '../ModalFormComponents/EditTagRow';
import ViewTagRow from '../ModalFormComponents/ViewTagRow';
import {SpaceRole} from "./Role";

const INACTIVE_EDIT_STATE_INDEX = -1;

function MyRolesForm(): JSX.Element {
    const RoleTags = () => {
        const [roles, setRoles] = useState<Array<Tag>>([]);
        const [editLocationIndex, setEditLocationIndex] = useState<number>(INACTIVE_EDIT_STATE_INDEX);

        return (
            <MyTraits
                traitClient={RoleClient}
                colorSection
                traitType="person"
                traitName="role"
            >
                {roles.map((role: Tag, index: number) => {
                    let colorToUse: string | undefined;
                    const spaceRole: SpaceRole = role as SpaceRole;
                    colorToUse = spaceRole.color ? spaceRole.color.color : '#FFFFFF';

                    return (
                        <React.Fragment key={index}>
                            {editLocationIndex != index &&
                            <ViewTagRow tag={role} index={index}>
                                <div className="viewTagRowColorCircle">
                                    <span data-testid="myRolesCircle"
                                        style={{'backgroundColor': colorToUse}}
                                        className={`myTraitsCircle ${colorToUse === '#FFFFFF' ? 'whiteCircleBorder' : ''}`}
                                    />
                                </div>
                            </ViewTagRow>
                            }
                            {editLocationIndex === index &&
                                <EditTagRow
                                    closeCallback={(): void => toggleEditSection(index)}
                                    updateCallback={updateTraits}
                                    trait={trait}
                                    colorSection={colorSection}
                                    traitClient={traitClient}
                                    traitName={traitName}
                                    currentSpace={currentSpace}
                                />
                            }
                        </React.Fragment>
                    );
                })}
            </MyTraits>
        );
    };
    
    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            <RoleTags />
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">Editing or deleting a role will affect any person currently assigned to it.</p>
            </div>
        </div>
    );
}

export default MyRolesForm;
