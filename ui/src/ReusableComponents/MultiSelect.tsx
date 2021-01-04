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

import React, {CSSProperties} from 'react';
import Select from 'react-select';
import {CustomIndicator, reactSelectStyles} from './ReactSelectStyles';
import {ReactSelectProps} from '../ModalFormComponents/ReactSelect';

export const multiSelectStyles = {
    ...reactSelectStyles,
    valueContainer: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        overflow:'unset',
        padding: '0 8px 0 6px',
    }),
    option: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        backgroundColor: 'transparent',
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
            backgroundColor: '#F2F2F2',
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
};

interface MultiSelectProps extends ReactSelectProps {
    isDisabled?: boolean;
}

function MultiSelect({
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
            <label className="formItemLabel" htmlFor={id}>{title}</label>
            <Select
                name={id}
                id={id}
                classNamePrefix="MultiSelect"
                placeholder={placeholder}
                value={values}
                options={options}
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

export default MultiSelect;
