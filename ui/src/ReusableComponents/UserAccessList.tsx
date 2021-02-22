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

import Select from 'react-select';
import {
    CustomIndicator,
    userAccessStyle,
    UserAccessListOption,
} from '../ModalFormComponents/ReactSelectStyles';
import React from 'react';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';

import './UserAccessList.scss';
import SpaceClient from '../Space/SpaceClient';

interface PermissionType {
    label: string;
    value: string;
}

const permissionOption: Array<PermissionType> = [
    {label:'Editor', value:'editor'},
    {label:'Remove', value:'remove'},
];

interface UserAccessListProps {
    currentSpace: Space;
    user: UserSpaceMapping;
    onRemoveUser: (userSpaceMapping: UserSpaceMapping) => void;
}

function UserAccessList({
    currentSpace,
    user,
    onRemoveUser,
}: UserAccessListProps): JSX.Element {

    // @ts-ignore
    const onChange = (value): void => {
        if ((value as PermissionType).value === 'remove') {
            SpaceClient.removeUser(currentSpace, user).then(() => onRemoveUser(user));
        }
    };

    return (
        <div className="userAccessDropdownContainer" data-testid="userAccess">
            <Select
                styles={userAccessStyle}
                id="userAccess-dropdown"
                className="userAccess-dropdown"
                classNamePrefix="userAccess"
                inputId="userAccess-dropdown-input"
                aria-labelledby="userAccess-dropdown-label"
                options={permissionOption}
                value={permissionOption[0]}
                onChange={onChange}
                isSearchable={false}
                components={{Option: UserAccessListOption, DropdownIndicator: CustomIndicator}}/>
        </div>
    );
}

export default UserAccessList;
