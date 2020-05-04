/*
 * Copyright (c) 2019 Ford Motor Company
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
import Select, {ValueType} from 'react-select';
import {CustomIndicator, reactSelectStyles} from './ReactSelectStyles';
import {Product} from '../Products/Product';

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
    }),
    placeholder: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontSize: '12px',
        textTransform: 'capitalize',
    }),
};

interface MultiSelectProps
{
    name: string;
    initiallySelected: Array<Product> | Product;
    changeSelections(events: ValueType<{}>): void;
    selectables: Array<Product>;
    disabled: boolean;
    placeholder: string;
}

function MultiSelect({
    name,
    initiallySelected,
    changeSelections,
    selectables,
    disabled,
    placeholder,
}: MultiSelectProps): JSX.Element {
    return (<Select
        classNamePrefix={'MultiSelect'}
        name={name}
        id={name}
        value={Array.isArray(initiallySelected) ? initiallySelected.map(x => {return {value:x.name, label:x.name};}) : {
            value: initiallySelected.name,
            label: initiallySelected.name,
        }}
        onChange={changeSelections}
        options={selectables.map(selectable => {
            return {value: selectable.name, label: selectable.name};
        })}
        isMulti={true}
        isDisabled={disabled}
        hideSelectedOptions={true}
        isClearable={false}
        styles={multiSelectStyles}
        components={{DropdownIndicator: CustomIndicator}}
        placeholder={placeholder}
    />);
}

export default MultiSelect;