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

import React, {useEffect, useState} from 'react';
import {getUserNameFromAccessToken} from '../Auth/TokenProvider';
import ShareAccessButton from './ShareAccessButton';
import DownloadReportButton from './DownloadReportButton';
import SignOutButton from './SignOutButton';

import './AccountDropdown.scss';

interface AccountDropdownProps {
    hideSpaceButtons?: boolean;
}

function AccountDropdown({ hideSpaceButtons }: AccountDropdownProps): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<JSX.Element>();

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    if ( redirect ) {
        return redirect;
    }

    const showDropdown = (): boolean => {
        if (dropdownToggle) {
            hideDropdown();
        } else {
            setDropdownToggle(!dropdownToggle);
            document.addEventListener('click', hideDropdown, false);
        }
        return dropdownToggle;
    };

    const hideDropdown = (): boolean => {
        setDropdownToggle(false);
        document.removeEventListener('click', hideDropdown);
        return dropdownToggle;
    };

    return (
        <>
            <button
                aria-label="Account Menu"
                data-testid="accountDropdownToggle"
                className="accountDropdownToggle"
                onClick={showDropdown}>
                <i className="material-icons" data-testid="userIcon">
                    person
                </i>
                {userName && (
                    <div className="welcomeUser">
                        Welcome, <span className="userName">{userName}</span>
                    </div>
                )}
                <i className="material-icons" data-testid="userIcon">
                    arrow_drop_down
                </i>
            </button>
            {dropdownToggle && (
                <div className="accountDropdown">
                    { !hideSpaceButtons && (<>
                        <ShareAccessButton />
                        <DownloadReportButton />
                    </>)}
                    <SignOutButton setRedirect={setRedirect} />
                </div>
            )}
        </>
    );
}

export default AccountDropdown;
