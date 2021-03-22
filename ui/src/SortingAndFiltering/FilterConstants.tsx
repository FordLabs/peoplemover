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
import ProductTagClient from '../ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import RoleClient from '../Roles/RoleClient';
import {TagClient} from '../Tags/TagClient.interface';
import {AxiosResponse} from 'axios';
import {Tag} from '../Tags/Tag.interface';
import {AvailableModals} from '../Modal/AvailableModals';

export interface FilterTypeListing {
    Location: FilterType;
    ProductTag: FilterType;
    Role: FilterType;
}

export const FilterTypeListings: FilterTypeListing = {
    Location: {index: 0, label: 'Product Location', modal: AvailableModals.MY_LOCATION_TAGS },
    ProductTag: {index: 1, label: 'Product Tags', modal: AvailableModals.MY_PRODUCT_TAGS},
    Role: {index: 2, label: 'Role', modal: AvailableModals.MY_ROLES_MODAL},
};

export interface FilterType {
    modal: AvailableModals;
    index: number;
    label: string;
}

export interface AllGroupedTagFilterOptions {
    label: LabelType;
    options: Array<FilterOption>;
}

export type LocalStorageFilters = {
    locationTagsFilters: Array<string>;
    productTagsFilters: Array<string>;
    roleTagsFilters: Array<string>;
}


export type LabelType = 'Location Tags:' | 'Product Tags:' | 'Role Tags:';

export async function getFilterOptionsForSpace(uuid: string): Promise<Array<AllGroupedTagFilterOptions>> {
    const localStorageFilter: LocalStorageFilters = getLocalStorageFilters();
    const productTagOptions: Array<FilterOption> = await buildTagOptions(uuid, ProductTagClient, localStorageFilter.productTagsFilters);
    const locationTagOptions: Array<FilterOption> = await buildTagOptions(uuid, LocationClient, localStorageFilter.locationTagsFilters);
    const roleTagOptions: Array<FilterOption> = await buildTagOptions(uuid, RoleClient, localStorageFilter.roleTagsFilters);
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
    ];
}

async function buildTagOptions(uuid: string, tagClient: TagClient, tagFilters: Array<string> = []): Promise<Array<FilterOption>> {
    const tagsResponse: AxiosResponse<Array<Tag>> = await tagClient.get(uuid);
    const tags: Array<Tag> = tagsResponse.data;
    return tags.map((tag: Tag): FilterOption => ({
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
    };
}
