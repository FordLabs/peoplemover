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

import React, {useEffect, useState} from 'react';
import Select from 'react-select';
import {connect} from 'react-redux';
import {AxiosResponse} from 'axios';
import {Dispatch} from 'redux';
import {CustomIndicator, filterByStyles, FilterControl, FilterOptions} from './ReactSelectStyles';
import ProductTagClient from '../ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import RoleClient from '../Roles/RoleClient';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import {TraitClient} from '../Traits/TraitClient';
import {Trait} from '../Traits/Trait';
import {FilterOption} from '../CommonTypes/Option';
import {Space} from '../SpaceDashboard/Space';

import './ProductFilterOrSortBy.scss';

export type LocalStorageFilters = {
    locationTagsFilters: Array<string>;
    productTagsFilters: Array<string>;
    roleTagsFilters: Array<string>;
}

export interface AllGroupedTagFilterOptions {
    label: string;
    options: Array<FilterOption>;
}

interface ProductFilterProps {
    currentSpace: Space;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}

function ProductFilter({
    currentSpace,
    setAllGroupedTagFilterOptions,
    allGroupedTagFilterOptions,
}: ProductFilterProps): JSX.Element {
    const [checkBoxFilterValues, setCheckBoxFilterValues] = useState<Array<FilterOption>>([]);

    useEffect(() => {
        initializeGroupedTagOptions().then();
    }, [currentSpace]);

    useEffect( () => {
        if (allGroupedTagFilterOptions.length > 0) {
            const selectedLocationFilters: Array<FilterOption> = allGroupedTagFilterOptions[0].options.filter(option => option.selected);
            const selectedProductFilters: Array<FilterOption> = allGroupedTagFilterOptions[1].options.filter(option => option.selected);
            const selectedRoleFilters: Array<FilterOption> = allGroupedTagFilterOptions[2].options.filter(option => option.selected);
            setCheckBoxFilterValues([...selectedLocationFilters, ...selectedProductFilters, ...selectedRoleFilters]);
        }
    }, [allGroupedTagFilterOptions, currentSpace]);

    async function initializeGroupedTagOptions(): Promise<void> {
        const localStorageFilter: LocalStorageFilters = getLocalStorageFilters();
        const productTagOptions: Array<FilterOption> = await buildTagOptions(ProductTagClient, localStorageFilter.productTagsFilters);
        const locationTagOptions: Array<FilterOption> = await buildTagOptions(LocationClient, localStorageFilter.locationTagsFilters);
        const roleTagOptions: Array<FilterOption> = await buildTagOptions(RoleClient, localStorageFilter.roleTagsFilters);
        const options: Array<AllGroupedTagFilterOptions>  = [
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
        setAllGroupedTagFilterOptions(options);
    }

    async function buildTagOptions(tagClient: TraitClient, tagFilters: Array<string> = []): Promise<Array<FilterOption>> {
        const tagsResponse: AxiosResponse<Array<Trait>> = await tagClient.get(currentSpace.name);
        const tags: Array<Trait> = tagsResponse.data;
        return tags.map((tag: Trait): FilterOption => ({
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

    function updateSelectedGroupedTagFilterOptions(
        selectedOptions: Array<FilterOption>,
        tagFilterOptions: AllGroupedTagFilterOptions
    ): Array<FilterOption> {
        return tagFilterOptions.options.map(
            option => {
                if (selectedOptions && selectedOptions.includes(option)) {
                    return {
                        ...option,
                        selected: true,
                    };
                } else {
                    return {
                        ...option,
                        selected: false,
                    };
                }
            }
        );
    }

    function applyFilter(selectedOptions: Array<FilterOption>): void {
        setCheckBoxFilterValues(selectedOptions);
        const updatedLocationTags: Array<FilterOption> = updateSelectedGroupedTagFilterOptions(
            selectedOptions,
            allGroupedTagFilterOptions[0]
        );
        const updatedProductTags: Array<FilterOption> = updateSelectedGroupedTagFilterOptions(
            selectedOptions,
            allGroupedTagFilterOptions[1]
        );
        const updatedRoleTags: Array<FilterOption> = updateSelectedGroupedTagFilterOptions(
            selectedOptions,
            allGroupedTagFilterOptions[2]
        );
        setAllGroupedTagFilterOptions([
            {...allGroupedTagFilterOptions[0], options: updatedLocationTags},
            {...allGroupedTagFilterOptions[1], options: updatedProductTags},
            {...allGroupedTagFilterOptions[2], options: updatedRoleTags},
        ]);
    }

    return (
        <React.Fragment>
            <label htmlFor="filterBy-dropdown" className="dropdown-label">Filter:</label>
            <Select
                styles={filterByStyles}
                name="filter"
                data-testid="filterBy-dropdown"
                className="dropdown filterBy-dropdown"
                inputId="filterBy-dropdown"
                classNamePrefix="product-filter"
                options={allGroupedTagFilterOptions}
                value={checkBoxFilterValues}
                isMulti
                isSearchable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={(values): void => applyFilter(values as Array<FilterOption>)}
                placeholder=""
                components={{Option: FilterOptions, DropdownIndicator: CustomIndicator, Control: FilterControl}}
            />
        </React.Fragment>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductFilter);