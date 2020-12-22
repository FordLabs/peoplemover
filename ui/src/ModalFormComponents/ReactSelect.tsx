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

import React, {useState} from 'react';
import {JSX} from '@babel/types';
import Creatable from 'react-select/creatable';
import {customStyles} from '../Products/ProductForm';
import {CreateNewText, CustomIndicator, CustomOption} from '../ReusableComponents/ReactSelectStyles';
import {Option} from '../CommonTypes/Option';

type TitleType = 'Product Tags' | 'Location'
type PlaceholderType = 'product tags' | 'location tag'
type IdType = 'productTags' | 'location';

interface Props {
    title: TitleType;
    placeholder: PlaceholderType;
    id: IdType;
    value: Option | undefined;
    options: Option[];
    onChange: (option: Option) => void;
    onSave: (inputValue: string) => void;
    isMulti?: boolean;
    isLoading: boolean;
}

function ReactSelect({
    title,
    placeholder,
    id,
    value,
    options,
    onChange,
    onSave,
    isMulti = false,
    isLoading,
}: Props): JSX.Element {
    const [typedInValue, setTypedInValue] = useState<string>('');

    const onInputChange = (e: string): void => setTypedInValue(e);

    const menuIsOpen = (): boolean | undefined => {
        const notTyping = typedInValue.length === 0;
        const typingFirstNewLocation = (notTyping && (options.length === 0));
        const selectedOnlyAvailableLocation = notTyping && (options.length === 1) && (options[0].label === (value && value.label));
        const noChangesInSelection = (typedInValue === (value && value.label));
        const hideMenu = noChangesInSelection || typingFirstNewLocation || selectedOnlyAvailableLocation;
        if (hideMenu) return false;
        return undefined;
    };

    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor={id}>{title}</label>
            <Creatable
                name={id}
                inputId={id}
                classNamePrefix={id}
                placeholder={`Add ${placeholder}`}
                value={value}
                options={options}
                styles={customStyles}
                components={{
                    DropdownIndicator: CustomIndicator,
                    Option: CustomOption,
                }}
                formatCreateLabel={(): JSX.Element => CreateNewText(typedInValue)}
                onInputChange={onInputChange}
                onChange={(option: unknown): void => onChange(option as Option)}
                onCreateOption={onSave}
                menuIsOpen={menuIsOpen()}
                isDisabled={isLoading}
                isLoading={isLoading}
                isMulti={isMulti}
                hideSelectedOptions={true}
                isClearable={!isMulti}
            />
        </div>
    );
}

export default ReactSelect;
