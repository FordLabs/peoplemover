/*!
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

import React, {useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import AccessibleDropdownContainer from './AccessibleDropdownContainer';
import {FilterOption} from '../CommonTypes/Option';
import './NewFilterOrSortBy.scss';


export type LabelType = 'Location Tags:' | 'Product Tags:' | 'Role Tags:';

export enum FilterTypeEnum {
    Location = 'Location',
    Product = 'Product',
    Role = 'Role'
}

export interface AllGroupedTagFilterOptions {
    label: LabelType;
    options: Array<FilterOption>;
}

function convertToIndex(labelType: FilterTypeEnum): number {
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

function convertToLabel(labelType: FilterTypeEnum): string {
    switch (labelType) {
        case FilterTypeEnum.Location:
            return 'Product Location:';
        case FilterTypeEnum.Product:
            return 'Product Tags:';
        case FilterTypeEnum.Role:
            return 'Role:';
        default:
            return '';
    }
}

function toggleOption(option: FilterOption): FilterOption {
    return {...option, selected: !option.selected};
}

interface NewFilterProps {
    filterType: FilterTypeEnum;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function NewFilter({
    filterType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: NewFilterProps): JSX.Element {
    const index = convertToIndex(filterType);

    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    const updateFilters = (option: FilterOption, ourIndex: number): void => {
        setAllGroupedTagFilterOptions(
            allGroupedTagFilterOptions.map((aGroupOfTagFilterOptions, index) => {
                if (index === ourIndex) {
                    return  {...aGroupOfTagFilterOptions, options: aGroupOfTagFilterOptions.options.map(anOption => {
                        if (anOption.value === option.value) {
                            return option;
                        } else {
                            return anOption;
                        }
                    })};
                } else {
                    return {...aGroupOfTagFilterOptions};
                }
            })
        );
    };

    const toggleDropdownMenu = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    return (
        <div className=" dropdown-group">
            <button
                id="NewFilter-button"
                className="dropdown-button"
                onClick={(): void => { toggleDropdownMenu();}}
            >
                <span className="dropdown-label" id={`dropdown-label_${filterType}`}>
                    {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                    && convertToLabel(filterType)}
                </span>
                {dropdownToggle
                    ? <i id={`dropdown-button-arrow-up_${filterType}`} className="material-icons greyIcon">keyboard_arrow_up</i>
                    : <i className="material-icons greyIcon">keyboard_arrow_down</i>
                }
            </button>
            {dropdownToggle &&
            <AccessibleDropdownContainer
                className="sortby-dropdown"
                handleClose={(): void => {
                    setDropdownToggle(false);
                }}
                dontCloseForTheseIds={['NewFilter-button', `dropdown-label_${filterType}`, `dropdown-button-arrow-up_${filterType}`]}
            >
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                && allGroupedTagFilterOptions[index].options.map(
                    (option) => {
                        return (
                            <div key={option.value} className="sortby-option">
                                <input
                                    type="checkbox"
                                    id={option.value}
                                    value={option.value}
                                    onChange={(event): void => {
                                        updateFilters(toggleOption(option), index);
                                    }}
                                />
                                <label htmlFor={option.value}>{option.label}</label>
                            </div>);
                    })}
            </AccessibleDropdownContainer>}
        </div>);
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewFilter);
/* eslint-enable */
