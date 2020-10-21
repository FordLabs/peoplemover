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

import React from 'react';
import MyTraits from '../Traits/MyTraits';
import RoleClient from './RoleClient';
import warningIcon from '../Application/Assets/warningIcon.svg';

import '../Traits/MyTraits.scss';

function MyRolesForm(): JSX.Element {
    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            <MyTraits
                traitClient={RoleClient}
                colorSection
                traitType="person"
                traitName="role"
            />
            <div className="traitWarning">
                <img src={warningIcon} className="warningIcon" alt="warning icon"/>
                <p className="warningText">Editing or deleting a role will affect any person currently assigned to it.</p>
            </div>
        </div>
    );
}

export default MyRolesForm;
