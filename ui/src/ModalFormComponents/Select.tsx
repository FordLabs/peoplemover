/*
 *   Copyright (c) 2020 Ford Motor Company
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, {ReactNode, useEffect, useState} from 'react';

import './Select.scss';

export interface OptionType {
    value: unknown;
    displayValue: ReactNode | string;
}

interface Props {
    selectedOption: OptionType;
    options: Array<OptionType>;
    onChange: (selectedOption: OptionType) => void;
}

const Select = ({ options, selectedOption, onChange }: Props): JSX.Element => {
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [currentOption, setCurrentOption] = useState<OptionType>(selectedOption);

    useEffect(() => {
        setCurrentOption(selectedOption);
    }, [selectedOption]);

    const showDropdown = (): void => {
        if (dropdownToggle) {
            hideDropdown();
        } else {
            setDropdownToggle(!dropdownToggle);
            document.addEventListener('click', hideDropdown, false);
        }
    };

    const hideDropdown = (): void => {
        setDropdownToggle(false);
        document.removeEventListener('click', hideDropdown);
    };

    const Dropdown = (): JSX.Element => {
        const Option = 'li';
        return (
            <ul className="selectDropdownOptions">
                {options && options.map((option, index) => {
                    const onClick = (): void => {
                        setCurrentOption(option);
                        onChange(option);
                    };
                    const isSelected = currentOption && option.value === currentOption.value;
                    return (
                        <Option
                            data-testid={`selectOption__${index}`}
                            className={`selectOption ${isSelected ? 'selected' : '' }`}
                            key={`select-option-${index}`}
                            onClick={onClick}>
                            {option.displayValue}
                        </Option>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="selectDropdown">
            <button className="selectDropdownToggle" onClick={showDropdown} data-testid="selectDropdownToggle">
                <i className={`selectDropdownArrow fas ${ dropdownToggle ? 'fa-caret-up' : 'fa-caret-down' }`} />
                {currentOption.displayValue}
            </button>
            {dropdownToggle && <Dropdown />}
        </div>
    );
};

export default Select;

