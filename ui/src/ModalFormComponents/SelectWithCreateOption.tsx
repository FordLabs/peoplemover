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

import React, {CSSProperties, useState} from 'react';
import {JSX} from '@babel/types';
import Creatable from 'react-select/creatable';
import {
    CreateNewText,
    CustomControl,
    CustomIndicator,
    CustomOption,
    reactSelectStyles,
} from './ReactSelectStyles';
import {Option} from '../CommonTypes/Option';
import {StylesConfig} from 'react-select';

const ReactSelectDropdownStyles: StylesConfig = {
    ...reactSelectStyles,
    valueContainer: (provided: CSSProperties) => ({
        ...provided,
        padding: '0px 3px',
    }),
    multiValue: (provided: CSSProperties) => ({
        ...provided,
        alignItems: 'center',
        backgroundColor: '#F2E7F3',
        fontFamily: 'Helvetica, sans-serif',
        borderRadius: '6px',
        height: '22px',
        marginRight: '3px',
    }),
    noOptionsMessage: (base) => {
        return {
            ...base,
            backgroundColor: 'transparent',
            fontFamily: 'Helvetica, sans-serif',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0px 17px 0 11px',
            height: '30px',
            margin: '3px 0px',
            '&:hover': {
                cursor: 'pointer',
                backgroundColor: '#F2F2F2',
            },
            color: '#999694',
            textAlign: 'left',
        };
    },
};

export const MetadataReactSelectProps = {
    PRODUCT_TAGS: {
        title: 'Product Tags',
        id: 'productTags',
        placeholder: 'Add product tags',
    },
    LOCATION_TAGS: {
        title: 'Location',
        id: 'location',
        placeholder: 'Add a location tag',
    },
    ROLE_TAGS: {
        title: 'Role',
        id: 'role',
        placeholder: 'Add a role',
    },
    ASSIGNMENT_NAME: {
        title: 'Name',
        id: 'person',
        placeholder: 'Add a Person',
    },
};

export interface Metadata {
    title: string;
    id: string;
    placeholder: string;
}

export interface ReactSelectProps {
    className?: string;
    metadata: Metadata;
    value?: Option | undefined;
    values?: Option[] | undefined;
    options: Option[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (option: any) => void;
    onSave?: (inputValue: string) => void;
    isMulti?: boolean;
    useColorBadge?: boolean;
    isLoading?: boolean;
}

function SelectWithCreateOption({
    className,
    metadata: {
        title,
        placeholder,
        id,
    },
    value,
    values,
    options,
    onChange,
    onSave,
    isMulti = false,
    useColorBadge = false,
    isLoading,
}: ReactSelectProps): JSX.Element {
    const [typedInValue, setTypedInValue] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const components: any = {
        DropdownIndicator: CustomIndicator,
        Option: CustomOption,
    };
    if (useColorBadge) components.Control = CustomControl;

    const onInputChange = (e: string): void => setTypedInValue(e);

    const menuIsOpenSingleSelect = (): boolean | undefined => {
        const notTyping = typedInValue.length === 0;
        const typingFirstNewLocation = (notTyping && (options.length === 0));
        const selectedOnlyAvailableLocation = notTyping && (options.length === 1) && (options[0].label === (value && value.label));
        const noChangesInSelection = (typedInValue === (value && value.label));
        const hideMenu = noChangesInSelection || typingFirstNewLocation || selectedOnlyAvailableLocation;
        if (hideMenu) return false;
        return undefined;
    };

    const menuIsOpenMultiSelect = (): boolean | undefined => {
        const notTyping = typedInValue.length === 0;
        const allOptionsSelected = options.length === values?.length;
        const noChangesInSelection = !!values?.find(value => value.label === typedInValue);
        const hideMenu = noChangesInSelection || (allOptionsSelected && notTyping);
        if (hideMenu) return false;
        return undefined;
    };

    const menuIsOpen = (): boolean | undefined => {
        if (isMulti) return menuIsOpenMultiSelect();
        return menuIsOpenSingleSelect();
    };

    return (
        <div className={`formItem ${className}`}>
            <label className="formItemLabel" htmlFor={id}>{title}</label>
            <Creatable
                name={id}
                inputId={id}
                classNamePrefix={id}
                placeholder={placeholder}
                value={value || values}
                options={options}
                styles={useColorBadge ? reactSelectStyles : ReactSelectDropdownStyles}
                components={components}
                formatCreateLabel={(): JSX.Element => CreateNewText(typedInValue)}
                onInputChange={onInputChange}
                onChange={(option: unknown): void => {
                    isMulti ? onChange(option as Option[]) : onChange(option as Option);
                }}
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

export default SelectWithCreateOption;
