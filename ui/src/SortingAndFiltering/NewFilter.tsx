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

import React from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {Dispatch} from 'redux';
import {setAllGroupedTagFilterOptionsAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {FilterOption} from '../CommonTypes/Option';
import './NewFilterOrSortBy.scss';
import Dropdown from '../ReusableComponents/Dropdown';
import {AllGroupedTagFilterOptions, FilterType} from './FilterConstants';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';

function toggleOption(option: FilterOption): FilterOption {
    return {...option, selected: !option.selected};
}

interface NewFilterProps {
    filterType: FilterType;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function NewFilter({
    filterType,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    setCurrentModal,
}: NewFilterProps): JSX.Element {

    const index = filterType.index;

    const updateFilters = (option: FilterOption, ourIndex: number): void => {
        setAllGroupedTagFilterOptions(
            allGroupedTagFilterOptions.map((aGroupOfTagFilterOptions, index) => {
                if (index === ourIndex) {
                    return {
                        ...aGroupOfTagFilterOptions, options: aGroupOfTagFilterOptions.options.map(anOption => {
                            if (anOption.value === option.value) {
                                return option;
                            } else {
                                return anOption;
                            }
                        }),
                    };
                } else {
                    return {...aGroupOfTagFilterOptions};
                }
            }),
        );
    };

    const formattedFilterTypeValue = filterType.label.replace(' ', '_');

    const getNumberOfSelectedFiltersAsString = (): string => {
        let numberOfSelectedFilters = 0;
        if (allGroupedTagFilterOptions[index] && allGroupedTagFilterOptions[index].options)
            numberOfSelectedFilters = allGroupedTagFilterOptions[index].options.filter(item => item.selected).length;
        return (numberOfSelectedFilters === 0 ? 'All' : numberOfSelectedFilters.toString());
    };

    const getNumberOfSelectedFiltersStyle = (): string => {
        return (getNumberOfSelectedFiltersAsString() === 'All' ? 'dropdown_filter_count_style_default' : 'dropdown_filter_count_style_badge');
    };

    const dropdownContent =
        <>
            <div className="sortby-option-container">
                {allGroupedTagFilterOptions
                && allGroupedTagFilterOptions.length > 0
                && allGroupedTagFilterOptions[index].options.map(
                    (option) => {
                        return (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                            <div key={option.value} onClick={(event): void => {
                                updateFilters(toggleOption(option), index);
                            }} className="sortby-option">
                                <input
                                    className="sortby-option-input"
                                    type="checkbox"
                                    id={option.value}
                                    value={option.value}
                                    checked={option.selected}
                                    onChange={(event): void => {
                                        updateFilters(toggleOption(option), index);
                                    }}
                                />
                                {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
                                <label className="sortby-option-label"
                                    htmlFor={option.value}
                                    onClick={(event): void => {
                                        event.stopPropagation();
                                    }}
                                >{option.label}
                                </label>
                            </div>
                        );
                    })}
            </div>
            <button className="add-edit-tags-dropdown-button"
                data-testid={`open_${formattedFilterTypeValue}_modal_button`}
                onClick={(): void => { setCurrentModal({modal: filterType.modal}); }}
            >
                <span>{`Add/Edit your ${filterType.label}`}</span>
                <i className="material-icons">keyboard_arrow_right</i>
            </button>
        </>;

    const dropdownButtonContent =
        <>
            <span className="dropdown-label" id={`dropdown-label_${formattedFilterTypeValue}`}>
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                    && filterType.label}:
            </span>
            <span
                data-testid={`filter_count_${formattedFilterTypeValue}`}
                className={getNumberOfSelectedFiltersStyle()}>
                {getNumberOfSelectedFiltersAsString()}
            </span>
        </>;

    return (
        <Dropdown
            buttonId={`NewFilter-button_${formattedFilterTypeValue}`}
            dropdownButtonContent={dropdownButtonContent}
            dropdownContent={dropdownContent}
            dropdownOptionIds={[`NewFilter-button_${formattedFilterTypeValue}`, `dropdown-label_${formattedFilterTypeValue}`, `dropdown-button-arrow-up_${formattedFilterTypeValue}`]}
            dropdownTestId={`dropdown_${formattedFilterTypeValue}`}
            buttonTestId={`dropdown_button_${formattedFilterTypeValue}`}
        />
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewFilter);
/* eslint-enable */
