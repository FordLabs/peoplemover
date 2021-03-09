/*
 * Copyright (c) 2021 Ford Motor Company
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
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import {getUserNameFromAccessToken} from '../Auth/TokenProvider';
import ShareAccessButton from './ShareAccessButton';
import DownloadReportButton from './DownloadReportButton';
import SignOutButton from './SignOutButton';

import './AccountDropdown.scss';
import AccessibleDropdownContainer from '../ReusableComponents/AccessibleDropdownContainer';

interface Props {
    hideSpaceButtons?: boolean;
    isReadOnly: boolean;
}

function AccountDropdown({hideSpaceButtons, isReadOnly}: Props): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [redirect, setRedirect] = useState<JSX.Element>();
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    if (redirect) return redirect;

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
                        <ShareAccessButton focusOnRender={true}/>
                        <DownloadReportButton/>
                        <SignOutButton setRedirect={setRedirect}/>
                    </>
                ) : (
                    <SignOutButton setRedirect={setRedirect} focusOnRender={true}/>
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
                <i className="material-icons" data-testid="userIcon" aria-hidden id={'accountDropdownToggle-personIcon'}>
                    person
                </i>
                {userName && (
                    <div className="welcomeUser" id={'accountDropdownToggle-welcome'}>
                        Welcome, <span id={'accountDropdownToggle-name'} className="userName">{userName}</span>
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

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isReadOnly: state.isReadOnly,
});

export default connect(mapStateToProps)(AccountDropdown);
/* eslint-enable */
