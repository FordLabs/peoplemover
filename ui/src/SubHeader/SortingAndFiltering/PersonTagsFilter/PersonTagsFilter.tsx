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

import React, {useCallback, useEffect, useState} from 'react';
import {FilterOption} from '../../../Types/Option';
import {
    FilterTypeListings,
    getLocalStorageFiltersByType,
    personTagsFilterKey,
    setLocalStorageFiltersByType,
} from '../FilterLibraries';
import {useRecoilValue} from 'recoil';
import {PersonTagsState} from 'State/PersonTagsState';
import Filter from '../Filter';
import MyTagsForm from '../MyTagsForm/MyTagsForm';
import {PersonTag} from 'Types/Tag';

function PersonTagsFilter() {
    const personTags = useRecoilValue(PersonTagsState);

    const getFilterOptions = useCallback((): Array<FilterOption> => {
        const selectedRolesFromLocalStorage = getLocalStorageFiltersByType(personTagsFilterKey);
        return personTags.map((tag: PersonTag): FilterOption => ({
            label: tag.name,
            value: tag.id + '_' + tag.name,
            selected: selectedRolesFromLocalStorage.includes(tag.name),
        }));
    },[personTags])

    const [personTagFilterOptions, setPersonTagFilterOptions] = useState<Array<FilterOption>>([]);

    useEffect(() => {
        setPersonTagFilterOptions(getFilterOptions())
    }, [getFilterOptions, personTags])

    function setFilterOptions(options: FilterOption[]) {
        setLocalStorageFiltersByType(personTagsFilterKey, options);
        setPersonTagFilterOptions(options);
    }

    return (
        <Filter
            label="Person Tags"
            defaultValues={personTagFilterOptions}
            onSelect={setFilterOptions}
            modalContents={{
                title: 'Person Tags',
                component: <MyTagsForm filterType={FilterTypeListings.PersonTag}/>
            }}/>
    )
}

export default PersonTagsFilter;