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

import {components, ControlProps, IndicatorProps, OptionProps, OptionTypeBase, Props} from 'react-select';
import React, {CSSProperties, ReactChild, ReactElement, ReactNode} from 'react';
import {Option} from '../CommonTypes/Option';

import './ReactSelectStyles.scss';

export const reactSelectStyles = {
    // @ts-ignore
    control: (provided: CSSProperties, {isFocused}): CSSProperties => ({
        ...provided,
        minHeight: '32px',
        borderRadius: '2px',
        padding: '0',
        // These lines disable the blue border
        boxShadow: isFocused ? '0 0 0 2px #4C8EF5' : 'none',
        border: '1px solid hsl(0, 0%, 80%)',
        width: '216px',
        backgroundColor: 'transparent',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    placeholder: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontSize: '12px',
        color: '#999694',
        fontFamily: 'Helvetica, sans-serif',
        lineHeight: '14px',
    }),
    option: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        backgroundColor: props.isFocused ? '#F2F2F2' : 'transparent',
        color: props.data.__isNew__ ? '#5463B0' : '#403D3D',
        border: props.isFocused ? '2px solid #4C8EF5' : 'none',
        borderRadius: '2px',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        lineHeight: '13.8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 17px 6px 0px',
        minHeight: '30px',
        margin: '3px 0px',
        overflowWrap: 'break-word',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    input: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        backgroundColor: 'transparent',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
    }),
    singleValue: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        alignItems: 'center',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '140px',
    }),
    clearIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px 8px',
    }),
    valueContainer: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px 8px',
    }),
    dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        paddingTop: 0,
        paddingBottom: 0,
    }),
    multiValueLabel: (): CSSProperties => ({
        color: '#403D3D',
        fontSize: '12px',
        paddingLeft: '5px',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '120px',
        whiteSpace: 'nowrap',
    }),
    multiValueRemove: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        color: '#403D3D',
        // @ts-ignore
        '&:hover': {
            color: '#5463B0',
            backgroundColor: '#F2E7F3',
        },
    }),
    multiValue: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        alignItems: 'center',
        backgroundColor: '#F2E7F3',
        fontFamily: 'Helvetica, sans-serif',
        borderRadius: '6px',
        height: '22px',
        margin: '3px',
    }),
    menu: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        marginTop: '1px',
        borderRadius: '0 0 4px 4px',
    }),
    indicatorSeparator: (): CSSProperties => ({
        display: 'none',
    }),
    menuList: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px',
    }),
};

export const sortByStyle = {
    ...reactSelectStyles,
    control: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: isUserTabbingAndFocusedOnElement(props) ? '0 0 0 2px #4C8EF5' : 'none',
        // @ts-ignore
        '&:hover': {
            boxShadow:  'none !important',
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
    menu: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        maxWidth: '150px',
        minWidth: '150px',
        right: '0',
        padding: '16px 15px',
        margin: '0',
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
    dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px',
    }),
};

export const filterByStyles = {
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

const isUserTabbingAndFocusedOnElement = ({isFocused}: Props): boolean => {
    return isFocused && document.body.classList.contains('user-is-tabbing');
};

export const CustomIndicator = (props: IndicatorProps<OptionTypeBase>): JSX.Element => (
    <components.DropdownIndicator {...props}>
        {
            props.options.length === 0
                ? <i style={{display: 'none'}}/>
                : (
                    props.selectProps.menuIsOpen
                        ? <i className="material-icons greyIcon" data-testid={props.selectProps.name}>arrow_drop_up</i>
                        : <i className="material-icons greyIcon" data-testid={props.selectProps.name}>arrow_drop_down</i>
                )
        }
    </components.DropdownIndicator>
);


export const SortByOption = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="sortby-option" {...innerProps}>
            <span className="sortby-label-name">{label}</span>
            {isSelected && <i className="material-icons sortby-option-check">check</i>}
        </div>
    );
};

export const FilterOptions = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="filter-option" {...innerProps}>
            <input className={'checkbox'} type="checkbox" name="optionCheckbox" checked={isSelected} readOnly/>
            <div className="filter-label-name">{label}</div>
        </div>
    );
};

export const FilterControl = (props: ControlProps<OptionTypeBase>): JSX.Element => {
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

export const CustomControl = (props: ControlProps<OptionTypeBase>): JSX.Element => {
    let color = 'transparent';

    if (props.hasValue) {
        const values = props.getValue() as Array<Option>;
        color = values[0]?.color ? values[0].color : 'transparent';
    } else if (props.children) {
        const valueContainer = (props.children as Array<JSX.Element>)[0];
        const inputContainer = valueContainer.props.children[1];
        color = inputContainer.props.value.color ? inputContainer.props.value.color : 'transparent';
    }

    return (
        <div className="customControlContainer">
            <div data-testid="custom-control-role-badge"
                style={{backgroundColor: color}}
                className="optionRoleBadge"/>
            <components.Control {...props}>{props.children}</components.Control>
        </div>
    );
};

export const CustomOption = (props: OptionProps<OptionTypeBase>): JSX.Element => (
    <components.Option {...props}>
        <div className="roleOptionLabel">{props.label}</div>
    </components.Option>
);


export const CreateNewText = (text: string): JSX.Element => (
    <span>
        {`Create "${text}"`}
    </span>
);
