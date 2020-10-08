/*
 * Copyright (c) 2020 Ford Motor Company
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
import React, {CSSProperties, ReactChild, ReactElement, ReactNode, RefObject, useEffect} from 'react';
import './ReactSelectStyles.scss';
import {ThemeApplier} from './ThemeApplier';
import CheckIcon from '../Application/Assets/checkIcon.svg';
import {Option} from '../CommonTypes/Option';
import {useOnLoad} from './UseOnLoad';

export const reactSelectStyles = {
    control: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        minHeight: '32px',
        borderRadius: '2px',
        padding: '0',
        // These lines disable the blue border
        boxShadow: 'none',
        border: '1px solid hsl(0, 0%, 80%) !important',
        backgroundColor: 'transparent',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    placeholder: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontSize: '12px',
        color: '#BFBCBB',
        fontFamily: 'Helvetica, sans-serif',
        lineHeight: '14px',
    }),
    option: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        backgroundColor: 'transparent',
        color: props.data.__isNew__ ? '#5463B0' : '#403D3D',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0px 17px 0 0px',
        height: '30px',
        margin: '3px 0px',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
            backgroundColor: '#F2F2F2',
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
        maxWidth: 'unset',
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
    control: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: 'none !important',
        // @ts-ignore
        '&:focus, &:hover': {
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
}

export const filterByStyles = {
    ...reactSelectStyles,
    control: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: 'none !important',
        // @ts-ignore
        '&:focus, &:hover': {
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
};

export const CustomIndicator = (props: IndicatorProps<OptionTypeBase>): JSX.Element => (
    <components.DropdownIndicator {...props}>
        {props.selectProps.menuIsOpen
            ?
            <i className="fas fa-caret-up greyIcon" data-testid={props.selectProps.name}/> :
            <i className="fas fa-caret-down greyIcon" data-testid={props.selectProps.name}/>}
    </components.DropdownIndicator>
);

export const SortByOption = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="sortby-option" {...innerProps}>
            <span className="sortby-label-name" >{label}</span>
            {isSelected && <img className="sortby-option-check" src={CheckIcon} alt={''}/>}
        </div>
    );
};

export const FilterOptions = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="filter-option" {...innerProps}>
            <input className={'checkbox'} type="checkbox" name="optionCheckbox" checked={isSelected} readOnly/>
            <div className="filter-label-name" >{label}</div>
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
    const colorBadgeRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    let label = '';

    if (props.hasValue) {
        const value = props.getValue() as Array<Option>;
        if (value && value.length > 0) {
            label = value[0].label;
        }
    } else if (props.children) {
        const valueContainer = (props.children as Array<JSX.Element>)[0];
        const inputContainer = valueContainer.props.children[1];
        label = inputContainer.props.value;
    }

    useEffect(() => {
        if (props.selectProps.getColorFromLabel && colorBadgeRef.current) {
            colorBadgeRef.current.style.backgroundColor = props.selectProps.getColorFromLabel(label);
        }
    }, [label, props.selectProps]);

    return (
        <div className="customControlContainer">
            <div data-testid="custom-control-role-badge"
                ref={colorBadgeRef}
                className={`optionRoleBadge`}/>
            <components.Control {...props}>{props.children}</components.Control>
        </div>
    );
};

export const CustomOption = (allTheProps: OptionProps<OptionTypeBase>): JSX.Element => {
    const {
        selectProps,
        ...propsForTheDiv
    } = allTheProps;

    const {label} = propsForTheDiv;
    // @ts-ignore
    const {value} = propsForTheDiv;
    const colorBadgeRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

    useOnLoad(() => {
        if (selectProps.getColorFromLabel && colorBadgeRef.current) {
            ThemeApplier.setBackgroundColorOnElement(colorBadgeRef.current, selectProps.getColorFromLabel(value));
        }
    });

    return (
        <components.Option {...allTheProps}>
            <div className={'optionRoleBadge'}
                ref={colorBadgeRef}
                data-testid={`RoleColorBadge`}>
            </div>
            <div className="roleOptionLabel">{label}</div>
        </components.Option>
    );
};

export const CreateNewText = (text: string): JSX.Element => (
    <span>
        <span className="fa fa-plus createNewPersonIcon"/>{text}
    </span>
);
