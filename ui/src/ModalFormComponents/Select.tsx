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

import './Select.scss';
import index from '../Redux/Reducers';

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
    const panelElement = useRef<HTMLUListElement>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(
        DEFAULT_CURRENT_INDEX
    );
    const [upKey, downKey, enterKey] = [38, 40, 13];

    useEffect(() => {
        setCurrentOption(selectedOption);
        setCurrentIndex(getOptionIndex);
    }, [selectedOption]);

    useEffect(() => {
        if (dropdownToggle && !!panelElement.current) {
            panelElement.current.focus();
        }
    }, [dropdownToggle]);

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

    const setSelectedItem = (index: number) => {
        if (currentIndex !== index) {
            setCurrentIndex(index);
        }
    };

    const getOptionIndex = (): number => {
        return options.map(option => JSON.stringify(option.value)).indexOf(JSON.stringify(currentOption.value));
    };

    const handleKeyDownList = (
        event: React.KeyboardEvent<HTMLUListElement>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        switch (event.keyCode) {
            case upKey:
                if (currentIndex !== undefined && currentIndex > 0) {
                    console.log('keyup');
                    setSelectedItem(currentIndex - 1);
                }
                break;
            case downKey:
                if (
                    currentIndex !== undefined &&
                    currentIndex < options.length - 1
                ) {
                    console.log('keydown');
                    setSelectedItem(currentIndex + 1);
                }
                break;
            case enterKey:
                hideDropdown();
                break;
        }
    };

    const isSelectedItem = (index: number): boolean => {
        return currentIndex === index;
    };

    const Dropdown = (): JSX.Element => {
        const Option = 'li';

        useEffect(() => {
            if (panelElement && panelElement.current) {
                console.log(panelElement.current.children);
            }
        }, [panelElement]);

        return (
            <ul
                onKeyDown={handleKeyDownList}
                className="selectDropdownOptions"
                role="listbox"
                tabIndex={0}
                ref={panelElement}
            >
                {options && options.map((option, index) => {
                    const onClick = (): void => {
                        setCurrentOption(option);
                        onChange(option);
                    };
                    console.log(currentIndex, index);
                    const isFocused = currentIndex === index;

                    return (
                        <Option
                            data-testid={`selectOption__${index}`}
                            aria-selected={isSelectedItem(index)}
                            aria-label={option.ariaLabel}
                            role="option"
                            className={`selectOption ${isFocused ? 'focused' : '' }`}
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
            <button
                className="selectDropdownToggle"
                aria-label={ariaLabel}
                aria-haspopup="listbox"
                onClick={showDropdown}
                data-testid="selectDropdownToggle">
                <i className={`selectDropdownArrow fas ${ dropdownToggle ? 'fa-caret-up' : 'fa-caret-down' }`} />
                {currentOption.displayValue}
            </button>
            {dropdownToggle && <Dropdown />}
        </div>
    );
};

export default Select;

