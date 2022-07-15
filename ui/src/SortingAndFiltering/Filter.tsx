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

import React from 'react';
import {FilterOption} from '../CommonTypes/Option';
import Dropdown from '../ReusableComponents/Dropdown';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';

import './FilterOrSortBy.scss';

interface Props {
    label: string;
    defaultValues: Array<FilterOption>;
    onSelect(options: FilterOption[]): void;
    modalContents: ModalContents,
}

function Filter({ label, defaultValues, onSelect, modalContents }: Props): JSX.Element {
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const labelId = label.replace(/ /g, '_').toLowerCase();
    const buttonId = `filter-button_${labelId}`;
    const dropdownLabelId = `dropdown-label_${labelId}`;
    const dropdownButtonArrowUpId = `dropdown-button-arrow-up_${labelId}`;
    const filterCountId = `filter-count_${labelId}`;

    const getNumberOfSelectedFilters = (): number => defaultValues.filter(item => item.selected).length || 0;
    const areFiltersSelected = (getNumberOfSelectedFilters() > 0);

    const getNumbersOfSelectedFiltersDisplayText = (): string => {
        const numOfSelectedFilters = getNumberOfSelectedFilters();
        return (numOfSelectedFilters === 0 ? 'All' : numOfSelectedFilters.toString());
    };

    const getNumberOfSelectedFiltersStyle = (): string => {
        return (areFiltersSelected ? 'dropdown_filter_count_style_badge' : 'dropdown_filter_count_style_default');
    };

    const clearFilter = (): void => {
        onSelect(defaultValues.map(v => {
            v.selected = false;
            return v;
        }));
    };

    const ClearFilterButton = (): JSX.Element => areFiltersSelected ?  (
        <button
            className="material-icons clear-filter-button"
            data-testid={`clearSelectedFilter__${labelId}`}
            onClick={clearFilter}
        >
            close
        </button>
    ) : <></>;

    const FilterDropdown = () => (
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
                    data-testid={`openModalButton__${labelId}`}
                    onClick={(): void => setModalContents(modalContents)}
                >
                    <span>Add/Edit your {label}</span>
                    <i className="material-icons">keyboard_arrow_right</i>
                </button>
            )}
        </>
    );

    const FilterSelector = () => (
        <>
            <span className="dropdown-label" id={dropdownLabelId}>
                {label}:
            </span>
            <span
                id={filterCountId}
                data-testid={`filterCount__${labelId}`}
                className={getNumberOfSelectedFiltersStyle()}>
                {getNumbersOfSelectedFiltersDisplayText()}
            </span>
        </>
    );

    return (
        <Dropdown
            dropdownButtonContent={<FilterSelector />}
            dropdownContent={<FilterDropdown />}
            clearFilterButton={<ClearFilterButton />}
            buttonId={buttonId}
            dropdownOptionIds={[buttonId, dropdownLabelId, dropdownButtonArrowUpId, filterCountId]}
            dropdownTestId={`dropdown_${labelId}`}
            buttonTestId={`dropdownButton__${labelId}`}
        />
    );
}

export default Filter;

