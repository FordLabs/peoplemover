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
import {getLocalStorageFiltersByType, setLocalStorageFiltersByType} from '../FilterLibraries';
import React, {useState} from 'react';
import MyRolesForm from '../../Roles/MyRolesForm';
import {useRecoilValue} from 'recoil';
import {RolesState} from '../../State/RolesState';
import {FilterOption} from '../../CommonTypes/Option';
import {TagInterface} from '../../Tags/Tag.interface';

function RolesFilter() {
    const roles = useRecoilValue(RolesState);

    const [roleFilterOptions, setRoleFilterOptions] = useState<Array<FilterOption>>(getFilterOptions());

    function getFilterOptions (): Array<FilterOption> {
        const selectedRolesFromLocalStorage = getLocalStorageFiltersByType('roleTagFilters');
        return roles.map((tag: TagInterface): FilterOption => ({
            label: tag.name,
            value: tag.id + '_' + tag.name,
            selected: selectedRolesFromLocalStorage.includes(tag.name),
        }));
    }

    function setFilterOptions(options: FilterOption[]) {
        setLocalStorageFiltersByType( 'roleTagFilters', options);
        setRoleFilterOptions(options);
    }

    return (
        <Filter
            label="Roles"
            defaultValues={roleFilterOptions}
            onSelect={setFilterOptions}
            modalContents={{ title: 'My Roles', component: <MyRolesForm/>}}
        />
    )
}

export default RolesFilter;