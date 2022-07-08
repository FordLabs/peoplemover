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

import React, {ReactNode} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {FilterOption} from '../CommonTypes/Option';
import Dropdown from '../ReusableComponents/Dropdown';
import {AllGroupedTagFilterOptions, FilterType} from './FilterLibraries';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';

import './FilterOrSortBy.scss';

interface Props {
    label: string;
    defaultValues: Array<FilterOption>;
    onSelect(options: FilterOption[]): void;

    modalContents: ModalContents,
    filterType: FilterType;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function Filter({
    label,
    defaultValues,
    onSelect,

    modalContents,
    filterType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
}: Props): JSX.Element {
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const filterIndex = filterType.index;

    const formattedFilterTypeValue = filterType.label.replace(' ', '_');

    const getNumberOfSelectedFilters = (): number => defaultValues.filter(item => item.selected).length || 0;

    const getNumbersOfSelectedFiltersDisplayText = (): string => {
        const numOfSelectedFilters = getNumberOfSelectedFilters();
        return (numOfSelectedFilters === 0 ? 'All' : numOfSelectedFilters.toString());
    };

    const areFiltersSelected = (getNumberOfSelectedFilters() > 0);

    const getNumberOfSelectedFiltersStyle = (): string => {
        return (areFiltersSelected ? 'dropdown_filter_count_style_badge' : 'dropdown_filter_count_style_default');
    };

    const clearFilter = (): void => {
        setAllGroupedTagFilterOptions(allGroupedTagFilterOptions.map((aGroupOfTagFilterOptions, index) => {
            if (index === filterIndex) {
                return {
                    ...aGroupOfTagFilterOptions, options: aGroupOfTagFilterOptions.options.map(anOption => {
                        return (anOption.selected) ? {...anOption, selected: false } : anOption;
                    }),
                };
            } else {
                return {...aGroupOfTagFilterOptions};
            }
        }),);
    };

    const getClearFilterButton = (): ReactNode => {
        if (areFiltersSelected) {
            return <button className="material-icons clear-filter-button"
                data-testid={`clear_selected_filter_${formattedFilterTypeValue}`}
                onClick={clearFilter}
            >
                close
            </button>;
        }
        return <></>;

    };

    const dropdownContent =
        <>
            <div className="sortby-option-container">
                {defaultValues.map(
                    (option) => {
                        return (
                            <div key={option.value} className="sortby-option">
                                <input
                                    className="sortby-option-input"
                                    type="checkbox"
                                    id={option.value}
                                    value={option.value}
                                    checked={option.selected}
                                    onChange={(): void => {
                                        const updatedValues = defaultValues.map((r) => {
                                            if(r.value === option.value) r.selected = !option.selected;
                                            return r;
                                        })
                                        onSelect(updatedValues);
                                    }}
                                />
                                <label className="sortby-option-label" htmlFor={option.value}>
                                    {option.label}
                                </label>
                            </div>
                        );
                    })}
            </div>
            {!isReadOnly && (
                <button className="add-edit-tags-dropdown-button"
                    data-testid={`open_${formattedFilterTypeValue}_modal_button`}
                    onClick={(): void => setModalContents(modalContents)}
                >
                    <span>{`Add/Edit your ${filterType.label}`}</span>
                    <i className="material-icons">keyboard_arrow_right</i>
                </button>
            )}
        </>;

    const dropdownButtonContent =
        <>
            <span className="dropdown-label" id={`dropdown-label_${formattedFilterTypeValue}`}>
                {label}:
            </span>
            <span
                id={`filter_count_${formattedFilterTypeValue}`}
                data-testid={`filter_count_${formattedFilterTypeValue}`}
                className={getNumberOfSelectedFiltersStyle()}>
                {getNumbersOfSelectedFiltersDisplayText()}
            </span>
        </>;

    return (
        <Dropdown
            buttonId={`Filter-button_${formattedFilterTypeValue}`}
            dropdownButtonContent={dropdownButtonContent}
            dropdownContent={dropdownContent}
            dropdownOptionIds={[`Filter-button_${formattedFilterTypeValue}`,
                `dropdown-label_${formattedFilterTypeValue}`,
                `dropdown-button-arrow-up_${formattedFilterTypeValue}`,
                `filter_count_${formattedFilterTypeValue}`]}
            dropdownTestId={`dropdown_${formattedFilterTypeValue}`}
            buttonTestId={`dropdown_button_${formattedFilterTypeValue}`}
            clearFilterButton={getClearFilterButton()}
        />
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Filter);
/* eslint-enable */
