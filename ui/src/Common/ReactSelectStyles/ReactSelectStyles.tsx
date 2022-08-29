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

import {components, IndicatorProps, OptionTypeBase, Props} from 'react-select';
import React, {CSSProperties} from 'react';

import './ReactSelectStyles.scss';

export const reactSelectStyles = {
    control: (provided: CSSProperties, {isFocused}: Props): CSSProperties => ({
        ...provided,
        minHeight: '32px',
        borderRadius: '2px',
        padding: '0',
        // These lines disable the blue border
        boxShadow: isFocused ? '0 0 0 2px #4C8EF5' : 'none',
        border: '1px solid hsl(0, 0%, 80%)',
        width: '216px',
        backgroundColor: 'transparent',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

export const CustomIndicator = (props: IndicatorProps<OptionTypeBase, boolean>): JSX.Element => {
    function getArrowIcon() {
        return props.selectProps.menuIsOpen
            ? <i className="material-icons greyIcon"
                data-testid={`upArrow_${props.selectProps.name}`}>arrow_drop_up</i>
            : <i className="material-icons greyIcon"
                data-testid={`downArrow_${props.selectProps.name}`}>arrow_drop_down</i>
    }

    return (
        <components.DropdownIndicator {...props}>
            {props.options.length === 0 ? <i style={{display: 'none'}}/> : getArrowIcon()}
        </components.DropdownIndicator>
    )
};
