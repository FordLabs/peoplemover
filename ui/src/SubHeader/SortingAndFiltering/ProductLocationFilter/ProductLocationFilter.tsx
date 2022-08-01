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
import {useRecoilValue} from 'recoil';
import {LocationsState} from '../../../State/LocationsState';
import MyTagsForm from '../../../Tags/MyTagsForm';
import {
    FilterTypeListings,
    getLocalStorageFiltersByType,
    locationTagsFilterKey,
    setLocalStorageFiltersByType,
} from '../FilterLibraries';
import {FilterOption} from '../../../Types/Option';
import Filter from '../Filter';
import {LocationTag} from '../../../Types/Tag';

function ProductLocationFilter() {
    const productLocations = useRecoilValue(LocationsState);

    const getFilterOptions = useCallback((): Array<FilterOption> => {
        const selectedRolesFromLocalStorage = getLocalStorageFiltersByType(locationTagsFilterKey);
        return productLocations.map((tag: LocationTag): FilterOption => ({
            label: tag.name,
            value: tag.id + '_' + tag.name,
            selected: selectedRolesFromLocalStorage.includes(tag.name),
        }));
    },[productLocations])

    const [locationFilterOptions, setLocationFilterOptions] = useState<Array<FilterOption>>([]);

    useEffect(() => {
        setLocationFilterOptions(getFilterOptions())
    }, [getFilterOptions, productLocations])

    function setFilterOptions(options: FilterOption[]) {
        setLocalStorageFiltersByType(locationTagsFilterKey, options);
        setLocationFilterOptions(options);
    }

    return (
        <Filter
            label="Product Location"
            defaultValues={locationFilterOptions}
            onSelect={setFilterOptions}
            modalContents={{
                title: 'Product Location',
                component: <MyTagsForm filterType={FilterTypeListings.Location}/>}
            }/>
    )
}

export default ProductLocationFilter;