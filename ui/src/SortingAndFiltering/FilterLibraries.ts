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

import {FilterOption} from '../CommonTypes/Option';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import RoleClient from '../Roles/RoleClient';
import {TagClient} from '../Tags/TagClient.interface';
import {AxiosResponse} from 'axios';
import {TagInterface} from '../Tags/Tag.interface';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';

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

export interface AllGroupedTagFilterOptions {
    label: LabelType;
    options: Array<FilterOption>;
}

export type LocalStorageFilters = {
    locationTagsFilters: string[];
    productTagsFilters: string[];
    roleTagsFilters: string[];
    personTagsFilters: string[];
}


export type LabelType = 'Location Tags:' | 'Product Tags:' | 'Role Tags:' | 'Person Tags:';
export type TagType = 'role' | 'product tag' | 'location' | 'person tag';
export type TagNameType = 'Role' | 'Product Tag' | 'Location' | 'Person Tag';

export async function getFilterOptionsForSpace(uuid: string): Promise<Array<AllGroupedTagFilterOptions>> {
    const localStorageFilter: LocalStorageFilters = getLocalStorageFilters();
    const productTagOptions: Array<FilterOption> = await buildTagOptions(uuid, ProductTagClient, localStorageFilter.productTagsFilters);
    const locationTagOptions: Array<FilterOption> = await buildTagOptions(uuid, LocationClient, localStorageFilter.locationTagsFilters);
    const roleTagOptions: Array<FilterOption> = await buildTagOptions(uuid, RoleClient, localStorageFilter.roleTagsFilters);
    const personTagOptions: Array<FilterOption> = await buildTagOptions(uuid, PersonTagClient, localStorageFilter.personTagsFilters);

    return [
        {
            label: 'Location Tags:',
            options: locationTagOptions,
        },
        {
            label: 'Product Tags:',
            options: productTagOptions,
        },
        {
            label: 'Role Tags:',
            options: roleTagOptions,
        },
        {
            label: 'Person Tags:',
            options: personTagOptions,
        },
    ];
}

export function addGroupedTagFilterOptions(
    tagFilterIndex: number,
    trait: TagInterface,
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>,
    setAllGroupedTagFilterOptions: (groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => void
): void {
    const addedFilterOption: FilterOption = {
        label: trait.name,
        value: trait.id.toString() + '_' + trait.name,
        selected: false,
    };
    const updatedTagFilterOptions: AllGroupedTagFilterOptions = {
        ...allGroupedTagFilterOptions[tagFilterIndex],
        options: [
            ...allGroupedTagFilterOptions[tagFilterIndex].options,
            addedFilterOption,
        ],
    };

    const groupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [...allGroupedTagFilterOptions];
    groupedTagFilterOptions[tagFilterIndex] = updatedTagFilterOptions;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions);
}

async function buildTagOptions(uuid: string, tagClient: TagClient, tagFilters: Array<string> = []): Promise<Array<FilterOption>> {
    const tagsResponse: AxiosResponse<Array<TagInterface>> = await tagClient.get(uuid);
    const tags: Array<TagInterface> = tagsResponse.data;
    return tags.map((tag: TagInterface): FilterOption => ({
        label: tag.name,
        value: tag.id + '_' + tag.name,
        selected: tagFilters.includes(tag.name),
    }));
}

function getLocalStorageFilters(): LocalStorageFilters {
    const localStorageFilters: string | null = localStorage.getItem('filters');
    if (localStorageFilters) return JSON.parse(localStorageFilters);
    return {
        locationTagsFilters: [],
        productTagsFilters: [],
        roleTagsFilters: [],
        personTagsFilters: [],
    };
}

export type filterTypes = 'locationTagsFilters' | 'productTagsFilter' | 'roleTagsFilters' | 'personTagsFilters';

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

    const allFilters = JSON.parse(localStorageFilters || defaultLocalStorageFilters());
    allFilters[filterType] = updatedFilters.filter(f => f.selected).map(f => f.label);
    localStorage.setItem('filters', JSON.stringify(allFilters));
}

function defaultLocalStorageFilters() {
    return JSON.stringify({
        locationsTagsFilters: [],
        productTagsFilter: [],
        roleTagsFilters: [],
        personTagsFilters: [],
    })
}

