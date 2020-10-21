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

import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {debounce} from '../Utils';

import './Select.scss';

const DEFAULT_CURRENT_INDEX = 0;

export interface OptionType {
    value: unknown;
    ariaLabel: string;
    displayValue: ReactNode | string;
}

interface Props {
    ariaLabel: string;
    selectedOption: OptionType;
    options: Array<OptionType>;
    onChange: (selectedOption: OptionType) => void;
}

const Select = ({ ariaLabel, options, selectedOption, onChange }: Props): JSX.Element => {
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [currentOption, setCurrentOption] = useState<OptionType>(selectedOption);
    const dropdownToggleElement = useRef<HTMLButtonElement>(null);
    const dropdownElement = useRef<HTMLUListElement>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(
        DEFAULT_CURRENT_INDEX
    );
    const [upKey, downKey, enterKey] = [38, 40, 13];

    useEffect(() => {
        const currentOptionIndex = options.map(option => JSON.stringify(option.value))
            .indexOf(JSON.stringify(currentOption.value));
        setCurrentIndex(currentOptionIndex);
    }, [options, currentOption]);

    useEffect(() => {
        setCurrentOption(selectedOption);
    }, [selectedOption]);

    useEffect(() => {
        const focusOnDropdown = (): void => {
            if (dropdownToggle && !!dropdownElement.current) {
                dropdownElement.current.focus();
            }
        };

        focusOnDropdown();
    }, [dropdownToggle, currentIndex]);

    const showDropdown = (): void => {
        debounce(() => {
            setDropdownToggle(true);
        }, 100)();
    };

    const toggleDropdown = (): void => {
        if (!dropdownToggle) {
            showDropdown();
        } else {
            hideDropdown();
        }
    };

    const hideDropdown = (): void => {
        debounce(() => {
            setDropdownToggle(false);
        }, 100)();
    };

    const setSelectedItem = (index: number): void => {
        if (currentIndex !== index) {
            setCurrentIndex(index);
        }
    };

    const updateSelectedOption = (option: OptionType, currentIndex: number): void => {
        setCurrentOption(option);
        setCurrentIndex(currentIndex);
        onChange(option);
        hideDropdown();
    };

    const handleKeyDownList = (event: React.KeyboardEvent<HTMLUListElement>): void => {
        event.preventDefault();
        event.stopPropagation();

        switch (event.keyCode) {
            case upKey:
                if (currentIndex !== undefined && currentIndex > 0)
                    setSelectedItem(currentIndex - 1);
                break;
            case downKey:
                if (currentIndex !== undefined && currentIndex < options.length - 1)
                    setSelectedItem(currentIndex + 1);
                break;
            case enterKey:
                if (dropdownToggleElement.current) {
                    dropdownToggleElement.current.focus();
                }
                updateSelectedOption(options[currentIndex], currentIndex);
                break;
        }
    };

    const handleKeyDownButton = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (!dropdownToggle && (event.keyCode === upKey || event.keyCode === downKey || event.keyCode === enterKey)) {
            event.preventDefault();
            event.stopPropagation();
            showDropdown();
        }
    };

    const Dropdown = (): JSX.Element => {
        const Option = 'li';
        return (
            <ul
                role="listbox"
                data-testid="selectDropdownOptions"
                onBlur={hideDropdown}
                aria-label={`${ariaLabel} Options`}
                onKeyDown={handleKeyDownList}
                className="selectDropdownOptions"
                tabIndex={0}
                ref={dropdownElement}
            >
                {options && options.map((option, index) => {
                    const isSelectedItem = currentIndex === index;
                    return (
                        <Option
                            data-testid={`selectOption__${index}`}
                            aria-selected={isSelectedItem}
                            aria-label={option.ariaLabel}
                            role="option"
                            className={`selectOption ${isSelectedItem ? 'focused' : '' }`}
                            key={`select-option-${index}`}
                            onClick={(): void => updateSelectedOption(option, index)}>
                            {option.displayValue}
                        </Option>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="selectDropdown">
            <button
                ref={dropdownToggleElement}
                className="selectDropdownToggle"
                aria-label={`${ariaLabel} Selector: ${currentOption.ariaLabel} is selected`}
                aria-haspopup="listbox"
                onClick={toggleDropdown}
                onKeyDown={handleKeyDownButton}
                data-testid="selectDropdownToggle">
                <i className={`selectDropdownArrow fas ${ dropdownToggle ? 'fa-caret-up' : 'fa-caret-down' }`} />
                {currentOption.displayValue}
            </button>
            {dropdownToggle && <Dropdown />}
        </div>
    );
};

export default Select;

