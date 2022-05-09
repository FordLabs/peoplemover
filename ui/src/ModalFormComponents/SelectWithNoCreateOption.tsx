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

import React, {CSSProperties} from 'react';
import Select, {Props} from 'react-select';
import {CustomIndicator, reactSelectStyles} from './ReactSelectStyles';
import {ReactSelectProps} from './SelectWithCreateOption';

export const multiSelectStyles = {
    ...reactSelectStyles,
    valueContainer: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        overflow:'unset',
        padding: '0 8px 0 6px',
    }),
    option: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        backgroundColor: props.isFocused ? '#F2F2F2' : 'transparent',
        border: props.isFocused ? '2px solid #4C8EF5' : 'none',
        borderRadius: '2px',
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0px 17px',
        height: '30px',
        margin: '3px 0px',
        // @ts-ignore
        '&:hover': {
            cursor: 'pointer',
        },
    }),
    placeholder: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontSize: '12px',
        textTransform: 'capitalize',
    }),
};

export const MetadataMultiSelectProps = {
    ASSIGNMENT_ASSIGN_TO: {
        title: 'Assign to',
        id: 'product',
        placeholder: 'Select a Product',
    },
    PERSON_ASSIGN_TO: {
        title: 'Assign to',
        id: 'product',
        placeholder: 'unassigned',
    },
    ARCHIVED_PERSON_ASSIGN_TO: {
        title: 'Assign to',
        id: 'product',
        placeholder: 'archived',
    },
};

interface MultiSelectProps extends ReactSelectProps {
    isDisabled?: boolean;
}

function SelectWithNoCreateOption({
    metadata: {
        title,
        placeholder,
        id,
    },
    values = [],
    options,
    onChange,
    isDisabled = false,
}: MultiSelectProps): JSX.Element {
    return (
        <div className="formItem">
            <span className="formItemLabel">{title}</span>
            <Select
                aria-label={title}
                name={id}
                id={id}
                classNamePrefix={id}
                placeholder={placeholder}
                value={values}
                options={options}
                // @ts-ignore
                styles={multiSelectStyles}
                components={{DropdownIndicator: CustomIndicator}}
                onChange={onChange}
                isDisabled={isDisabled || options.length === 0}
                isMulti={true}
                hideSelectedOptions={true}
                isClearable={false}
            />
        </div>
    );
}

export default SelectWithNoCreateOption;
