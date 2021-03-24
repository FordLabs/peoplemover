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

    const dropdownContent =
        <>
            {allGroupedTagFilterOptions
            && allGroupedTagFilterOptions.length > 0
            && allGroupedTagFilterOptions[index].options.map(
                (option) => {
                    return (
                        <div key={option.value} className="sortby-option">
                            <input
                                type="checkbox"
                                id={option.value}
                                value={option.value}
                                checked={option.selected}
                                onChange={(event): void => {
                                    updateFilters(toggleOption(option), index);
                                }}
                            />
                            <label htmlFor={option.value}>{option.label}</label>
                        </div>
                    );
                })}
            <button className="add-edit-tags-dropdown-button" onClick={(): void => { setCurrentModal({modal: filterType.modal}); }}>
                <span>{`Add/edit your ${filterType.label}`}</span>
                <i className="material-icons greyIcon">keyboard_arrow_right</i>
            </button>
        </>;

    const dropdownButtonContent =
        <>
            <span className="dropdown-label" id={`dropdown-label_${filterType}`}>
                {allGroupedTagFilterOptions && allGroupedTagFilterOptions.length > 0
                    && filterType.label}:
            </span>
        </>;

    return (
        <Dropdown
            buttonId={`NewFilter-button_${filterType.label}`}
            dropdownButtonContent={dropdownButtonContent}
            dropdownContent={dropdownContent}
            dropdownOptionIds={[`NewFilter-button_${filterType.label}`, `dropdown-label_${filterType.label}`, `dropdown-button-arrow-up_${filterType.label}`]}
            dropdownTestId={`dropdown_${filterType.label}`}
            buttonTestId={`dropdown_button_${filterType.label}`}
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
