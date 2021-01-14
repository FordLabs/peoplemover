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

import React, {useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {getUserNameFromAccessToken} from '../Auth/TokenProvider';
import ShareAccessButton from './ShareAccessButton';
import DownloadReportButton from './DownloadReportButton';
import SignOutButton from './SignOutButton';
import debounce from '../Utils/debounce';
import { useClickOutside } from 'react-click-outside-hook';

import './AccountDropdown.scss';

const DEFAULT_CURRENT_INDEX = 0;
const DROPDOWN_OPTIONS_LENGTH = 3;

interface Props {
    hideSpaceButtons?: boolean;
    isReadOnly: boolean;
}

function AccountDropdown({hideSpaceButtons, isReadOnly}: Props): JSX.Element {
    const [ref, hasClickedOutside] = useClickOutside();
    const [userName, setUserName] = useState<string>('');
    const [redirect, setRedirect] = useState<JSX.Element>();
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const dropdownElement = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(
        DEFAULT_CURRENT_INDEX
    );
    const [upKey, downKey, enterKey] = [38, 40, 13];

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    useEffect(() => {
        const focusOnDropdown = (): void => {
            if (dropdownToggle && !!dropdownElement.current) {
                dropdownElement.current.focus();
            }
        };

        focusOnDropdown();
    }, [dropdownToggle, currentIndex]);

    if (redirect) return redirect;

    const handleKeyDownList = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        event.preventDefault();
        event.stopPropagation();

        switch (event.keyCode) {
            case upKey:
                if (currentIndex !== undefined && currentIndex > 0) {
                    // setSelectedItem(currentIndex - 1);
                    console.log('upKey', currentIndex - 1);
                    setCurrentIndex(currentIndex - 1);
                }
                break;
            case downKey:
                if (currentIndex !== undefined && currentIndex < DROPDOWN_OPTIONS_LENGTH - 1) {
                    // setSelectedItem(currentIndex + 1);
                    setCurrentIndex(currentIndex + 1);
                    console.log('downKey', currentIndex + 1);
                }
                break;
            case enterKey:
                // if (dropdownToggleElement.current) {
                //     dropdownToggleElement.current.focus();
                // }
                // updateSelectedOption(options[currentIndex], currentIndex);
                console.log('ENTER');
                break;
        }
    };

    const toggleDropdown = (): void => {
        setDropdownVisible(!dropdownToggle);
    };

    const hideDropdown = (): void => {
        console.log('On Blur')
        setDropdownVisible(false);
    };

    const showDropdown = (): void => {
        setDropdownVisible(true);
    };

    const setDropdownVisible = (visible: boolean): void => {
        debounce(() => {
            setDropdownToggle(visible);
        }, 100)();
    };

    const AccountDropdown = (): JSX.Element => {
        return (
            <div role="menu" className="accountDropdown" onBlur={hideDropdown} ref={dropdownElement}>
                {!hideSpaceButtons && !isReadOnly && (
                    <>
                        <ShareAccessButton/>
                        <DownloadReportButton/>
                    </>
                )}
                <SignOutButton setRedirect={setRedirect}/>
            </div>
        );
    };

    return (
        <>
            <button
                aria-label="Settings and More"
                aria-haspopup={true}
                aria-expanded={false}
                data-testid="accountDropdownToggle"
                className="accountDropdownToggle"
                onClick={toggleDropdown}
            >
                <i className="material-icons" data-testid="userIcon">
                    person
                </i>
                {userName && (
                    <div className="welcomeUser">
                        Welcome, <span className="userName">{userName}</span>
                    </div>
                )}
                <i className="material-icons selectDropdownArrow">
                    {dropdownToggle ? 'arrow_drop_up' : 'arrow_drop_down'}
                </i>
            </button>
            {dropdownToggle && <AccountDropdown/>}
        </>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isReadOnly: state.isReadOnly,
});

export default connect(mapStateToProps)(AccountDropdown);
/* eslint-enable */
