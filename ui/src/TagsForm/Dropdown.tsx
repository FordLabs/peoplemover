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

import React, {useState, useRef, useEffect, RefObject, createRef} from 'react';

// import errorWarning from '../../../assets/error-warning.png';

import './Dropdown.scss';
import {Color, SpaceRole} from "../Roles/Role";
import ColorClient from "../Roles/ColorClient";
import {RoleAddRequest} from "../Roles/RoleAddRequest";
import {TraitAddRequest} from "../Traits/TraitAddRequest";
import ColorCircle from "./ColorCircle";

interface Props {
    value: string | number;
    label: string;
    options: string[];
    className?: string;
    onChange: (value: string) => void;
    onClick?: () => void;
    disabled?: boolean;
    errorMessage?: string;
}

const DEFAULT_CURRENT_INDEX = 0;

const Dropdown = (props: Props): JSX.Element => {
    const buttonElement = useRef<HTMLButtonElement>(null);
    const panelElement = useRef<HTMLUListElement>(null);
    const itemElements: HTMLLIElement[] = [];

    const [currentIndex, setCurrentIndex] = useState<number>(
        DEFAULT_CURRENT_INDEX
    );
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [colors, setColors] = useState<Array<Color>>([]);
    const colorRefs: Array<RefObject<HTMLSpanElement>> = [];

    useEffect(() => {
        async function setup(): Promise<void> {
            const colorsResponse = await ColorClient.getAllColors();
            const colors: Array<Color> = colorsResponse.data;
            setColors(colors);
        }

        setup().then();
    });

    const options = Array.from(props.options);
    options.unshift(props.label);

    const [upKey, downKey, enterKey] = [38, 40, 13];

    const setSelectedItem = (index: number): void => {
        const panel = panelElement.current;
        const selectedItem = itemElements.find(element =>
            element.classList.contains('dropdown-item-' + index)
        );

        if (!!panel && !!selectedItem) {
            const scrollBottom = panel.clientHeight + panel.scrollTop;
            const elementBottom =
                selectedItem.offsetTop + selectedItem.offsetHeight;

            if (elementBottom > scrollBottom) {
                panel.scrollTop = elementBottom - panel.clientHeight;
            } else if (selectedItem.offsetTop < panel.scrollTop) {
                panel.scrollTop = selectedItem.offsetTop;
            }
        }

        if (currentIndex !== index) {
            setCurrentIndex(index);
            props.onChange(options[index]);
        }
    };

    const openDropdown = (): void => {
        setIsOpen(true);
        setSelectedItem(currentIndex);
    };

    const closeDropdown = (focusButton: boolean): void => {
        setIsOpen(false);
        if (focusButton && buttonElement.current) {
            buttonElement.current.focus();
        }
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
                if (
                    currentIndex !== undefined &&
                    currentIndex < options.length - 1
                )
                    setSelectedItem(currentIndex + 1);
                break;
            case enterKey:
                closeDropdown(true);
                break;
        }
    };

    const handleKeyDownButton = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (!isOpen && (event.keyCode === upKey || event.keyCode === downKey)) {
            event.preventDefault();
            event.stopPropagation();
            openDropdown();
        }
    };

    const isSelectedItem = (index: number): boolean => {
        return currentIndex === index;
    };

    useEffect(() => {
        if (isOpen && !!panelElement.current) {
            panelElement.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        let newIndex = DEFAULT_CURRENT_INDEX;
        const currentIndexOfValue = options.indexOf(String(props.value));
        if (currentIndexOfValue > 0) newIndex = currentIndexOfValue;

        setCurrentIndex(newIndex);
    }, [props.value, options]);

    return (
        <div className={`dropdown ${props.className}`} onClick={props.onClick}>
            {props.errorMessage && (
                <div className="error-message">
                    {props.errorMessage}
                    {/*<img src={errorWarning} alt="" className="error-icon" />*/}
                </div>
            )}
            <button
                className="dropdown-button"
                onClick={openDropdown}
                disabled={props.disabled}
                aria-haspopup="listbox"
                ref={buttonElement}
                onKeyDown={handleKeyDownButton}
            >
                <div className="dropdown-current-item">
                    <span>
                        {currentIndex !== undefined
                            ? options[currentIndex]
                            : props.label}
                    </span>
                    {/*<FdsChevron*/}
                    {/*    direction={isOpen ? 'up' : 'down'}*/}
                    {/*    type="unfilled"*/}
                    {/*/>*/}
                </div>
            </button>
            {isOpen && (
                <ul
                    className="dropdown-items-panel"
                    tabIndex={0}
                    role="listbox"
                    ref={panelElement}
                    onKeyDown={handleKeyDownList}
                    onBlur={() => {
                        closeDropdown(false);
                    }}
                >
                    {/*{options.map((option, index) => (*/}
                    {/*    <li*/}
                    {/*        key={option.toLowerCase()}*/}
                    {/*        className={`dropdown-item dropdown-item-${index} ${*/}
                    {/*            isSelectedItem(index) ? 'selected-item' : ''*/}
                    {/*        }`}*/}
                    {/*        onClick={() => {*/}
                    {/*            setSelectedItem(index);*/}
                    {/*            closeDropdown(false);*/}
                    {/*        }}*/}
                    {/*        aria-selected={isSelectedItem(index)}*/}
                    {/*        role="option"*/}
                    {/*        ref={addItemRef}*/}
                    {/*    >*/}
                    {/*        {option}*/}
                    {/*    </li>*/}
                    {/*))}*/}
                    {colors.map((color: Color, index: number) => {
                        const ref: RefObject<HTMLSpanElement> = createRef();
                        colorRefs.push(ref);

                        return (
                            <li>
                                <ColorCircle key={index} color={color}/>
                                {/*<span key={index}*/}
                                {/*  ref={ref}*/}
                                {/*  data-testid="selectRoleCircle"*/}
                                {/*  style={{'backgroundColor': color.color}}*/}
                                {/*  onClick={(): void => highlightCircle(ref, color)}*/}
                                {/*  onKeyDown={(e): void => handleKeyDownForHighlightCircle(e, ref, color)}*/}
                                {/*  className={`myTraitsCircle selectRoleCircle ${highlightDefaultCircle(color, index)} ${putBorderOnWhiteCircle(index)}`}/>*/}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
