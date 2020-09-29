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
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import Cookies from 'universal-cookie';
import {Redirect} from 'react-router-dom';
import ReportClient from '../Reports/ReportClient';
import {Space} from '../SpaceDashboard/Space';
import {GlobalStateProps} from '../Redux/Reducers';
import {getUserNameFromAccessToken} from '../Auth/TokenProvider';

import './AccountDropdown.scss';

interface AccountDropdownProps {
    currentSpace: Space;
    viewingDate: Date;
    hideSpaceButtons?: boolean;
    setCurrentModal(modalState: CurrentModalState): void;
}

function AccountDropdown({
    currentSpace,
    viewingDate,
    setCurrentModal,
    hideSpaceButtons,
}: AccountDropdownProps): JSX.Element {
    const [userName, setUserName] = useState<string>('');
    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<JSX.Element>();

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    function showsDropdown(): boolean {
        if (dropdownFlag) {
            hidesDropdown();
        } else {
            setDropdownFlag(!dropdownFlag);
            document.addEventListener('click', hidesDropdown, false);
        }
        return dropdownFlag;
    }

    function hidesDropdown(): boolean {
        setDropdownFlag(false);
        document.removeEventListener('click', hidesDropdown);
        return dropdownFlag;
    }

    function clearAccessTokenCookie(): void {
        const cookie = new Cookies();
        cookie.remove('accessToken', {path: '/'});

        setRedirect(<Redirect to="/"/>);
    }

    if ( redirect ) {
        return redirect;
    }

    function handleKeyDownForSetCurrentModalToEditContributors(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            setCurrentModalToEditContributors();
        }
    }

    function handleKeyDownForHandleDownloadReport(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            handleDownloadReport();
        }
    }

    function handleKeyDownForClearAccessTokenCookie(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            clearAccessTokenCookie();
        }
    }

    // eslint-disable-next-line @typescript-eslint/camelcase
    const handleDownloadReport = async (): Promise<void> => {
        await ReportClient.getReportsWithNames(currentSpace.name, currentSpace.uuid!!, viewingDate);
    };
    const setCurrentModalToEditContributors = (): void => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS});

    return (
        <button data-testid="editContributorsModal" className="editContributorsModal" onClick={showsDropdown}>
            <div className="accountDropdownToggle">
                <i className="fas fa-user" data-testid="userIcon"/>
                {userName &&
                    <div className="welcomeUser">
                        Welcome, <span className="userName">{userName}</span>
                    </div>
                }
                <i className="fas fa-caret-down drawerCaret"/>
            </div>
            {dropdownFlag && <div className="dropdown-container">
                {window.runConfig.invite_users_to_space_enabled && !hideSpaceButtons &&
                    <div data-testid="share-access"
                        className="account-dropdown-options"
                        onClick={setCurrentModalToEditContributors}
                        onKeyDown={(e): void => {handleKeyDownForSetCurrentModalToEditContributors(e);}}>
                        Share Access
                    </div>
                }
                {!hideSpaceButtons &&
                    <div data-testid="download-report"
                        className="account-dropdown-options"
                        onClick={handleDownloadReport}
                        onKeyDown={(e): void => {handleKeyDownForHandleDownloadReport(e);}}>
                        Download Report
                    </div>
                }
                <div data-testid="sign-out"
                    className="account-dropdown-options"
                    onClick={(): void => clearAccessTokenCookie()}
                    onKeyDown={(e): void => {handleKeyDownForClearAccessTokenCookie(e);}}>
                    Sign Out
                </div>
            </div>
            }
        </button>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountDropdown);
/* eslint-enable */