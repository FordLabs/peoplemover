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
import {CustomIndicator, filterByStyles, FilterControl, FilterOptions} from './ReactSelectStyles';
import ProductTagClient from '../ProductTag/ProductTagClient';
import LocationClient from '../Locations/LocationClient';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptions} from '../Redux/Actions';
import './ProductFilterOrSortBy.scss';
import {TraitClient} from '../Traits/TraitClient';
import {AxiosResponse} from 'axios';
import {Trait} from '../Traits/Trait';
import {Dispatch} from 'redux';
import {FilterOption} from '../CommonTypes/Option';


export type LocalStorageFilters = {
    locationTagsFilters: Array<string>;
    productTagsFilters: Array<string>;
}

export interface AllGroupedTagFilterOptions {
    label: string;
    options: Array<FilterOption>;
}

interface ProductFilterProps {
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}

function ProductFilter({
    setAllGroupedTagFilterOptions,
    allGroupedTagFilterOptions,
}: ProductFilterProps): JSX.Element {

    const [checkBoxFilterValues, setCheckBoxFilterValues] = useState<Array<FilterOption>>([]);

    useEffect(() => {
        initializeGroupedTagOptions().then();
    }, []);

    useEffect( () => {
        if (allGroupedTagFilterOptions.length > 0) {
            const selectedLocationFilters: Array<FilterOption> = allGroupedTagFilterOptions[0].options.filter(option => option.selected);
            const selectedProductFilters: Array<FilterOption> = allGroupedTagFilterOptions[1].options.filter(option => option.selected);
            setCheckBoxFilterValues([...selectedLocationFilters, ...selectedProductFilters]);
        }
    }, [allGroupedTagFilterOptions]);

    async function initializeGroupedTagOptions(): Promise<void> {
        const localStorageFilter: LocalStorageFilters = getLocalStorageFilters();
        const productTagOptions: Array<FilterOption> = await buildTagOptions(ProductTagClient, localStorageFilter.productTagsFilters);
        const locationTagOptions: Array<FilterOption> = await buildTagOptions(LocationClient, localStorageFilter.locationTagsFilters);
        const options: Array<AllGroupedTagFilterOptions>  = [
            {
                label: 'Location Tags:',
                options: locationTagOptions,
            },
            {
                label: 'Product Tags:',
                options: productTagOptions,
            },
        ];
        setAllGroupedTagFilterOptions(options);
    }

    async function buildTagOptions(tagClient: TraitClient, tagFilters: Array<string>): Promise<Array<FilterOption>> {
        const tagsResponse: AxiosResponse<Array<Trait>> = await tagClient.get();
        const tags: Array<Trait> = tagsResponse.data;
        return tags.map((tag: Trait): FilterOption => ({
            label: tag.name,
            value: tag.id.toString(),
            selected: tagFilters.includes(tag.name),
        }));
    }

    function getLocalStorageFilters(): LocalStorageFilters {
        const localStorageFilters: string | null = localStorage.getItem('filters');
        if (localStorageFilters) {
            return JSON.parse(localStorageFilters);
        }
        return {
            locationTagsFilters:[],
            productTagsFilters:[],
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
        setAllGroupedTagFilterOptions([
            {...allGroupedTagFilterOptions[0], options: updatedLocationTags},
            {...allGroupedTagFilterOptions[1], options: updatedProductTags},
        ]);
    }

    return (
        <React.Fragment>
            <label htmlFor="filterBy-dropdown" className={'dropdown-label'}>Filter:</label>
            <Select
                styles={filterByStyles}
                name={'filter'}
                data-testid={'filterBy-dropdown'}
                className={'dropdown filterBy-dropdown'}
                inputId="filterBy-dropdown"
                options={allGroupedTagFilterOptions}
                value={checkBoxFilterValues}
                isMulti
                isSearchable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={(values): void => applyFilter(values as Array<FilterOption>)}
                placeholder={''}
                components={{Option: FilterOptions, DropdownIndicator: CustomIndicator, Control: FilterControl}}
            />
        </React.Fragment>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptions(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductFilter);