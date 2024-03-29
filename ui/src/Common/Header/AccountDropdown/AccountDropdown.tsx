/*
 * Copyright (c) 2022 Ford Motor Company
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
import {getUserNameFromAccessToken} from 'Services/TokenService';
import ShareAccessButton from './ShareAccessButton/ShareAccessButton';
import DownloadReportButton from './DownloadReportButton/DownloadReportButton';
import SignOutButton from './SignOutButton/SignOutButton';

import AccessibleDropdownContainer from 'Common/AccessibleDropdownContainer/AccessibleDropdownContainer';
import {useRecoilState, useRecoilValue} from 'recoil';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import {CurrentUserState} from 'State/CurrentUserState';

import './AccountDropdown.scss';

interface Props {
    hideSpaceButtons?: boolean;
    showAllDropDownOptions: boolean;
}

function AccountDropdown({hideSpaceButtons, showAllDropDownOptions}: Props): JSX.Element {
    const [currentUser, setCurrentUser] = useRecoilState(CurrentUserState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    useEffect(() => {
        setCurrentUser(getUserNameFromAccessToken());
    }, [setCurrentUser]);

    const openDropdown = (event: React.KeyboardEvent): void => {
        if (event.key === 'ArrowDown' && !dropdownToggle) {
            toggleDropdown();
        }
    };

    const toggleDropdown = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    const AccountDropdownContent = (): JSX.Element => {
        return (
            <AccessibleDropdownContainer
                handleClose={(): void => {setDropdownToggle(false);}}
                className="accountDropdown"
                dropdownOptionIds={[
                    'accountDropdownToggle',
                    'accountDropdownToggle-arrow',
                    'accountDropdownToggle-name',
                    'accountDropdownToggle-welcome',
                    'accountDropdownToggle-personIcon']}
            >
                {(!hideSpaceButtons && !isReadOnly) ? (
                    <>
                        {(showAllDropDownOptions) && <ShareAccessButton focusOnRender={true} />}
                        {(showAllDropDownOptions) && <DownloadReportButton/>}
                        <SignOutButton />
                    </>
                ) : (
                    <SignOutButton focusOnRender={true}/>
                )}
            </AccessibleDropdownContainer>
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
                id={'accountDropdownToggle'}
                onKeyUp={(e): void => {openDropdown(e);}}
            >
                <i className="material-icons userIcon" data-testid="userIcon" aria-hidden id={'accountDropdownToggle-personIcon'}>
                    person
                </i>
                {currentUser && (
                    <div className="welcomeUser" id="accountDropdownToggle-welcome" data-testid="currentUserMessage">
                        Welcome, <span id="accountDropdownToggle-name" className="userName">{currentUser}</span>
                    </div>
                )}
                <i className="material-icons selectDropdownArrow" id={'accountDropdownToggle-arrow'}>
                    {dropdownToggle ? 'arrow_drop_up' : 'arrow_drop_down'}
                </i>
            </button>
            {dropdownToggle && <AccountDropdownContent/>}
        </>
    );
}

export default AccountDropdown;
