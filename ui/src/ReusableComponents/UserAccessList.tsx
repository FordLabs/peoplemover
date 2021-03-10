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

import Select, {OptionProps, OptionTypeBase, Props} from 'react-select';
import {
    CustomIndicator,
    isUserTabbingAndFocusedOnElement,
    reactSelectStyles,
} from '../ModalFormComponents/ReactSelectStyles';
import React, {CSSProperties, useState} from 'react';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';

import './UserAccessList.scss';
import SpaceClient from '../Space/SpaceClient';
import ConfirmationModal from '../Modal/ConfirmationModal';

interface PermissionType {
    label: string;
    value: string;
}

const permissionOption: Array<PermissionType> = [
    {label:'Editor', value:'editor'},
    {label:'Owner', value:'owner'},
    {label:'Remove', value:'remove'},
];

const getPermissionOption = (isUserOwner: boolean): Array<PermissionType> => {
    if (isUserOwner) {
        return permissionOption;
    } else {
        return [permissionOption[0], permissionOption[2]];
    }
};

interface UserAccessListProps {
    currentSpace: Space;
    user: UserSpaceMapping;
    onChange: () => void;
    owner: UserSpaceMapping;
    isUserOwner: boolean;
}

const UserAccessListOption = ({label, innerProps, isSelected, isFocused}: OptionProps<OptionTypeBase>): JSX.Element =>
    (
        <div className="userAccess-option" {...innerProps} style={
            isFocused ?
                { backgroundColor: '#F2F2F2', boxShadow: '0 0 0 2px #4C8EF5'} :
                { backgroundColor: 'transparent', boxShadow: 'none'}
        }>
            <span className="userAccess-label-name" data-testid="userAccessOptionLabel">{label}</span>
            {isSelected && <i className="material-icons">check</i>}
        </div>
    );


const userAccessStyle = {
    ...reactSelectStyles,
    control: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: isUserTabbingAndFocusedOnElement(props) ? '0 0 0 2px #4C8EF5' : 'none',
        // @ts-ignore
        '&:hover': {
            boxShadow: 'none !important',
            cursor: 'pointer',
        },
        flexWrap: 'unset',
    }),
    singleValue: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        borderRadius: '6px',
        padding: '6px',
        color: '#403D3D',
        float: 'right',
    }),
    menu: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        left: '1rem',
        padding: '0',
        margin: '0',
        minWidth: '8.125rem',
        borderRadius: '6px',
    }),
    dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px',
    }),
};

function UserAccessList({
    currentSpace,
    user,
    onChange,
    owner,
    isUserOwner,
}: UserAccessListProps): JSX.Element {
    const [displayConfirmationModal, setDisplayConfirmationModal] = useState(false);

    // @ts-ignore
    const onChangeEvent = (value): void => {
        switch ((value as PermissionType).value) {
            case 'remove':
                SpaceClient.removeUser(currentSpace, user).then(onChange);
                break;
            case 'owner':
                setDisplayConfirmationModal(true);
        }
    };

    const onSubmitOwnerChange = (): void => {
        SpaceClient.changeOwner(currentSpace, owner, user).then(onChange);
    };

    return (
        <>
            {displayConfirmationModal &&
                <ConfirmationModal
                    submit={onSubmitOwnerChange}
                    close={(): void => setDisplayConfirmationModal(false)}
                    submitButtonLabel="Yes"
                    closeButtonLabel="No"
                    title="Make this person the owner?"
                    content={<div>By making this person the owner, you will only have editor privileges for this space and will lose the ability to delete the space.</div>} />
            }
            <Select
                styles={userAccessStyle}
                id="userAccess-dropdown"
                className="userAccess-dropdown"
                classNamePrefix="userAccess"
                inputId="userAccess-dropdown-input"
                aria-label={user.permission}
                options={getPermissionOption(isUserOwner)}
                value={permissionOption[0]}
                onChange={onChangeEvent}
                isSearchable={false}
                components={{Option: UserAccessListOption, DropdownIndicator: CustomIndicator}}/>
        </>
    );
}

export default UserAccessList;
