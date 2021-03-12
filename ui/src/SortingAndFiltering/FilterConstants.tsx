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

import {AvailableModals} from '../Redux/Actions';
import {FilterOption} from '../CommonTypes/Option';
import ProductTagClient from '../ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import RoleClient from '../Roles/RoleClient';
import {TagClient} from '../Tags/TagClient.interface';
import {AxiosResponse} from 'axios';
import {Tag} from '../Tags/Tag.interface';


export interface FilterType {
    name: string;
    index: number;
    modal: AvailableModals;
    label: string;
}

export interface FilterTypeListing {
    Location: FilterType;
    Product: FilterType;
    Role: FilterType;
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

export enum FilterTypeEnum {
    Location = 'Location',
    Product = 'Product',
    Role = 'Role'
}

export function convertToIndex(labelType: FilterTypeEnum): number {
    switch (labelType) {
        case FilterTypeEnum.Location:
            return 0;
        case FilterTypeEnum.Product:
            return 1;
        case FilterTypeEnum.Role:
            return 2;
        default:
            return -1;
    }
}

export function convertToLabel(labelType: FilterTypeEnum): string {
    switch (labelType) {
        case FilterTypeEnum.Location:
            return 'Product Location';
        case FilterTypeEnum.Product:
            return 'Product Tags';
        case FilterTypeEnum.Role:
            return 'Role';
        default:
            return '';
    }
}

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
