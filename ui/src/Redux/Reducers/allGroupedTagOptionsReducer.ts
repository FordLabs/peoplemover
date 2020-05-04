/*
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

import {AvailableActions} from '../Actions';
import {AllGroupedTagFilterOptions, LocalStorageFilters} from '../../ReusableComponents/ProductFilter';
import {FilterOption} from '../../CommonTypes/Option';
import {getSelectedTagsFromGroupedTagOptions} from '../../Products/ProductList';

function sortTags(tags: Array<FilterOption>): Array<FilterOption> {
    return tags.sort((tag1: FilterOption, tag2: FilterOption) => {
        return tag1.label.toLowerCase().localeCompare(tag2.label.toLowerCase());
    });
}

function updateLocalStorage(tagOptions: Array<AllGroupedTagFilterOptions>): void {
    const selectedFilterOptions: LocalStorageFilters = {
        locationTagsFilters: getSelectedTagsFromGroupedTagOptions(tagOptions[0].options),
        productTagsFilters: getSelectedTagsFromGroupedTagOptions(tagOptions[1].options),
    };
    localStorage.setItem('filters', JSON.stringify(selectedFilterOptions));
}

const allGroupedTagFilterOptionsReducer = (
    state: Array<AllGroupedTagFilterOptions> = [],
    action: {type: AvailableActions; allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>}
): Array<AllGroupedTagFilterOptions> => {

    if (action.type === AvailableActions.SET_GROUPED_TAG_FILTER_OPTIONS) {
        const copiedFilters: Array<AllGroupedTagFilterOptions> = {...action.allGroupedTagFilterOptions};
        const sortedLocations: Array<FilterOption> = sortTags(copiedFilters[0].options);
        const sortedProductTags: Array<FilterOption> = sortTags(copiedFilters[1].options);

        updateLocalStorage(action.allGroupedTagFilterOptions);

        return [
            {...action.allGroupedTagFilterOptions[0], options: sortedLocations},
            {...action.allGroupedTagFilterOptions[1], options: sortedProductTags},
        ];
    }
    return state;
};
export default allGroupedTagFilterOptionsReducer;