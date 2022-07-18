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

import {FilterOption} from '../Types/Option';
import {localStorageEventListenerKey} from '../Hooks/useOnStorageChange/useOnStorageChange';

export interface FilterTypeListing {
    Location: FilterType;
    ProductTag: FilterType;
    Role: FilterType;
    PersonTag: FilterType;
}

export const FilterTypeListings: FilterTypeListing = {
    Location: {index: 0, label: 'Product Location', tagType: 'location', tagNameType: 'Location' },
    ProductTag: {index: 1, label: 'Product Tags', tagType: 'product tag', tagNameType: 'Product Tag'},
    Role: {index: 2, label: 'Role', tagType: 'role', tagNameType: 'Role'},
    PersonTag: {index: 3, label: 'Person Tags', tagType: 'person tag', tagNameType: 'Person Tag'},
};

export interface FilterType {
    index: number;
    label: string;
    tagType: TagType;
    tagNameType: TagNameType;
}

export type TagType = 'role' | 'product tag' | 'location' | 'person tag';
export type TagNameType = 'Role' | 'Product Tag' | 'Location' | 'Person Tag';



export const locationTagsFilterKey = 'locationTagFilters';
export const productTagsFilterKey = 'productTagFilters';
export const roleTagsFilterKey = 'roleTagFilters';
export const personTagsFilterKey = 'personTagFilters'

export type filterTypes = typeof locationTagsFilterKey
    | typeof productTagsFilterKey
    | typeof roleTagsFilterKey
    | typeof personTagsFilterKey;

export interface LocalStorageFilters {
    [locationTagsFilterKey]: string[];
    [productTagsFilterKey]: string[];
    [roleTagsFilterKey]: string[];
    [personTagsFilterKey]: string[];
}

export function getLocalStorageFiltersByType(filterType: filterTypes): Array<string> {
    const localStorageFilters: string | null = localStorage.getItem('filters');
    if (localStorageFilters) {
        const allFilters = JSON.parse(localStorageFilters);
        return allFilters[filterType] || []
    }
    return [];
}

export function setLocalStorageFiltersByType(filterType: filterTypes, updatedFilters: FilterOption[]): void {
    const localStorageFilters: string | null = localStorage.getItem('filters');

    const allFilters = localStorageFilters ? JSON.parse(localStorageFilters) : defaultLocalStorageFilters();
    allFilters[filterType] = updatedFilters.filter(f => f.selected).map(f => f.label);
    localStorage.setItem('filters', JSON.stringify(allFilters));

    window.dispatchEvent(new Event(localStorageEventListenerKey));
}

function defaultLocalStorageFilters(): LocalStorageFilters {
    return {
        locationTagFilters: [],
        productTagFilters: [],
        roleTagFilters: [],
        personTagFilters: [],
    }
}