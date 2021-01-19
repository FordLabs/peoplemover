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

import './AccountDropdown.scss';

interface Props {
    hideSpaceButtons?: boolean;
    isReadOnly: boolean;
}

function AccountDropdown({hideSpaceButtons, isReadOnly}: Props): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [redirect, setRedirect] = useState<JSX.Element>();
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const dropdownElement = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    useEffect(() => {
        if (dropdownToggle) {
            dropdownElement.current?.focus();
        }
    }, [dropdownToggle]);

    if (redirect) return redirect;

    const toggleDropdown = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
        if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
            setDropdownToggle(false);
        }
    };

    const AccountDropdown = (): JSX.Element => {
        return (
            <div
                role="menu"
                className="accountDropdown"
                onBlur={handleBlur}
                ref={dropdownElement}
                tabIndex={0}
            >
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
                aria-expanded={dropdownToggle}
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
