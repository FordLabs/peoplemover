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

import Filter from '../Filter';
import {getLocalStorageFiltersByType, roleTagsFilterKey, setLocalStorageFiltersByType} from '../FilterLibraries';
import React, {useCallback, useEffect, useState} from 'react';
import MyRolesForm from '../../Roles/MyRolesForm';
import {useRecoilValue} from 'recoil';
import {RolesState} from '../../State/RolesState';
import {FilterOption} from '../../Types/Option';
import {RoleTag} from '../../Types/Tag';

function RolesFilter() {
    const roles = useRecoilValue(RolesState);

    const getFilterOptions = useCallback((): FilterOption[] => {
        const selectedRolesFromLocalStorage = getLocalStorageFiltersByType(roleTagsFilterKey);
        return roles.map((tag: RoleTag): FilterOption => ({
            label: tag.name,
            value: tag.id + '_' + tag.name,
            selected: selectedRolesFromLocalStorage.includes(tag.name),
        }));
    },[roles])

    const [roleFilterOptions, setRoleFilterOptions] = useState<FilterOption[]>([]);

    useEffect(() => {
        setRoleFilterOptions(getFilterOptions())
    }, [getFilterOptions, roles])

    function setFilterOptions(options: FilterOption[]) {
        setLocalStorageFiltersByType(roleTagsFilterKey, options);
        setRoleFilterOptions(options);
    }

    return (
        <Filter
            label="Role"
            defaultValues={roleFilterOptions}
            onSelect={setFilterOptions}
            modalContents={{ title: 'My Roles', component: <MyRolesForm/> }}
        />
    )
}

export default RolesFilter;