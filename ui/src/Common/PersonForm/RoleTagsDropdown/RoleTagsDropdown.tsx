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

import React from "react";
import {Option} from "Types/Option";
import SelectWithCreateOption, {MetadataReactSelectProps} from "Common/SelectWithCreateOption/SelectWithCreateOption";
import {RoleTag} from "../../../Types/Tag";
import {RoleTagRequest} from "../../../Types/TagRequest";
import RoleClient from "../../../Services/Api/RoleClient";
import {AxiosResponse} from "axios";
import useFetchRoles from "../../../Hooks/useFetchRoles/useFetchRoles";
import {useRecoilValue} from "recoil";
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from "../../../State/CurrentSpaceState";

const { ROLE_TAGS } = MetadataReactSelectProps;

interface Props {
    spaceRole?: RoleTag;
    onChange(role?: RoleTag): void;
    setIsLoading(isLoading: boolean): void;
    isLoading: boolean;
}

function RoleTagsDropdown({ spaceRole, onChange, setIsLoading, isLoading }: Props) {
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const spaceUuid = useRecoilValue(UUIDForCurrentSpaceSelector);
    const { fetchRoles, roles } = useFetchRoles(spaceUuid);

    const updateSpaceRole = (input: string): void => {
        const roleMatch: RoleTag | undefined = roles.find((role: RoleTag) => role.name === input);
        onChange(roleMatch)
    };

    const createOption = (role: RoleTag): Option => {
        return ({
            label: role.name,
            value: role.name,
            color: role.color?.color,
        });
    };

    const handleCreateRole = (inputValue: string): void => {
        setIsLoading(true);
        const roleAddRequest: RoleTagRequest = {name: inputValue};
        RoleClient.add(roleAddRequest, currentSpace).then((response: AxiosResponse) => {
            const newRole: RoleTag = response.data;
            fetchRoles();
            // updatePersonField('spaceRole', newRole);
            onChange(newRole)
            setIsLoading(false);
        });
    };

    return (
        <SelectWithCreateOption
            metadata={ROLE_TAGS}
            useColorBadge
            value={spaceRole && spaceRole?.name !== '' ? createOption(spaceRole) : undefined}
            options={roles.map(role => createOption(role))}
            onChange={(e): void => updateSpaceRole(e ? (e as Option).value : '')}
            onSave={handleCreateRole}
            isLoading={isLoading}
        />
    )
}

export default RoleTagsDropdown;