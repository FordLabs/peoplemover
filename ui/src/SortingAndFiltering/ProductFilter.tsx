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

import React, {CSSProperties, ReactChild, ReactElement, ReactNode, useEffect, useState} from 'react';
import Select, {components, ControlProps, OptionProps, OptionTypeBase, Props} from 'react-select';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {
    CustomIndicator,
    isUserTabbingAndFocusedOnElement,
    reactSelectStyles,
} from '../ModalFormComponents/ReactSelectStyles';
import {GlobalStateProps} from '../Redux/Reducers';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {FilterOption} from '../CommonTypes/Option';
import {Space} from '../Space/Space';

import './ProductFilterOrSortBy.scss';
import MatomoEvents from '../Matomo/MatomoEvents';
import {AllGroupedTagFilterOptions} from './FilterConstants';

interface ProductFilterProps {
    currentSpace: Space;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}

const FilterOptions = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="filter-option" {...innerProps}>
            <input className={'checkbox'} type="checkbox" name="optionCheckbox" checked={isSelected} readOnly/>
            <div className="filter-label-name">{label}</div>
        </div>
    );
};

const FilterControl = (props: ControlProps<OptionTypeBase>): JSX.Element => {
    const {children, selectProps} = props;
    const maxToShow = 3;
    const numberOfSelectedFilters = selectProps.value ? selectProps.value.length : 0;
    const filterChips: Array<ReactNode> = React.Children.toArray(children);
    const valueContainer: ReactElement = filterChips[0] as ReactElement;
    const multiValueContainers: Array<ReactChild> = valueContainer.props.children[0];

    if (numberOfSelectedFilters > maxToShow) {
        multiValueContainers.splice(maxToShow, numberOfSelectedFilters - maxToShow);
        const showMoreFiltersDiv: JSX.Element = (
            <div className="addtionalFilterMultiValue" key="andMoreFilters">
                {`and ${numberOfSelectedFilters - maxToShow} more...`}
            </div>
        );
        if (Array.isArray(multiValueContainers)) {
            multiValueContainers.push(showMoreFiltersDiv);
        }
    }

    return (
        <components.Control {...props}>
            {props.children}
        </components.Control>
    );
};

const filterByStyles = {
    ...reactSelectStyles,
    control: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: isUserTabbingAndFocusedOnElement(props) ? '0 0 0 2px #4C8EF5' : 'none',

        // @ts-ignore
        '&:hover': {
            boxShadow: 'none !important',
            borderColor: '#EDEBEB',
            cursor: 'pointer',
        },
        flexWrap: 'unset',
    }),
    singleValue: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        backgroundColor: '#F2E7F3',
        borderRadius: '6px',
        padding: '6px',
        color: '#403D3D',
        float: 'right',
    }),
    valueContainer: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        overflow: 'unset',
        padding: '0 8px 0 2px',
        flexWrap: 'unset',
    }),
    option: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0px 10px',
        height: '30px',
        margin: '3px 0px',
        cursor: 'pointer',
    }),
    indicatorSeparator: (): CSSProperties => ({
        display: 'none',
    }),
    clearIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0',
        fontSize: '12px',
        // @ts-ignore
        svg: {
            height: '14px',
            width: 'auto',
            fill: '#403D3D',
        },
        'svg:hover': {
            fill: '#5463B0',
        },
    }),
    menu: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        maxWidth: '150px',
        minWidth: '150px',
        right: '0',
        padding: '16px 0px 16px 15px',
        margin: '0',
    }),
    groupHeading: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontWeight: 'bold',
        color: '#403D3D',
        fontSize: '12px',
        textTransform: 'none',
        paddingLeft: '0',
    }),
    group: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontSize: '12px',
    }),
    dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px',
    }),
};

function ProductFilter({
    currentSpace,
    setAllGroupedTagFilterOptions,
    allGroupedTagFilterOptions,
}: ProductFilterProps): JSX.Element {
    const [checkBoxFilterValues, setCheckBoxFilterValues] = useState<Array<FilterOption>>([]);

    useEffect( () => {
        if (allGroupedTagFilterOptions.length > 0) {
            const selectedLocationFilters: Array<FilterOption> = allGroupedTagFilterOptions[0].options.filter(option => option.selected);
            const selectedProductFilters: Array<FilterOption> = allGroupedTagFilterOptions[1].options.filter(option => option.selected);
            const selectedRoleFilters: Array<FilterOption> = allGroupedTagFilterOptions[2].options.filter(option => option.selected);
            setCheckBoxFilterValues([...selectedLocationFilters, ...selectedProductFilters, ...selectedRoleFilters]);
        }
    }, [allGroupedTagFilterOptions, currentSpace]);

    function updateSelectedGroupedTagFilterOptions(
        selectedOptions: Array<FilterOption>,
        tagFilterOptions: AllGroupedTagFilterOptions
    ): Array<FilterOption> {
        return tagFilterOptions.options.map(
            option => (
                {
                    ...option,
                    selected: selectedOptions && selectedOptions.includes(option),
                }
            )
        );
    }

    function sendMatomoEvent(selectedOptions: Array<FilterOption>): void {
        let selectedOptionsString = 'filter selected';
        if (selectedOptions) {
            selectedOptionsString = selectedOptions.filter(option => option.selected).map(option => option.label).join(', ');
        }
        MatomoEvents.pushEvent(currentSpace.name, 'filter', selectedOptionsString);
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

        sendMatomoEvent(selectedOptions);
    }

    return (
        <div className="filterDropdownContainer" data-testid="filters">
            <label id="filterBy-dropdown-label" htmlFor="filterBy-dropdown" className="dropdown-label">Filter:</label>
            <Select
                styles={filterByStyles}
                name="filter"
                className="dropdown filterBy-dropdown"
                inputId="filterBy-dropdown"
                aria-labelledby="filterBy-dropdown-label"
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
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductFilter);
/* eslint-enable */
