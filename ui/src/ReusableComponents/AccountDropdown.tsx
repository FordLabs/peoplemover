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
import {Redirect} from 'react-router-dom';
import ReportClient from '../Reports/ReportClient';
import {Space} from '../SpaceDashboard/Space';
import {GlobalStateProps} from '../Redux/Reducers';
import {getUserNameFromAccessToken, removeToken} from '../Auth/TokenProvider';

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
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<JSX.Element>();

    useEffect(() => {
        setUserName(getUserNameFromAccessToken());
    }, []);

    if ( redirect ) {
        return redirect;
    }

    const showsDropdown = (): boolean => {
        if (dropdownToggle) {
            hidesDropdown();
        } else {
            setDropdownToggle(!dropdownToggle);
            document.addEventListener('click', hidesDropdown, false);
        }
        return dropdownToggle;
    };

    const hidesDropdown = (): boolean => {
        setDropdownToggle(false);
        document.removeEventListener('click', hidesDropdown);
        return dropdownToggle;
    };

    const ShareAccessButton = (): JSX.Element => {
        const openEditContributorsModal = (): void => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS});
        const showButton = window.runConfig.invite_users_to_space_enabled && !hideSpaceButtons;
        const onkeydown = (event: React.KeyboardEvent): void => {
            if (event.key === 'Enter') openEditContributorsModal();
        };

        return showButton ? (
            <div className="account-dropdown-options"
                data-testid="share-access"
                onClick={openEditContributorsModal}
                onKeyDown={onkeydown}>
                    Share Access
            </div>
        ) : <></>;
    };

    const DownloadReportButton = (): JSX.Element => {
        const showButton = !hideSpaceButtons;
        // eslint-disable-next-line @typescript-eslint/camelcase
        const handleDownloadReport = async (): Promise<void> => {
            await ReportClient.getReportsWithNames(currentSpace.name, currentSpace.uuid!!, viewingDate);
        };
        const onKeyDown = (event: React.KeyboardEvent): void => {
            if (event.key === 'Enter') handleDownloadReport().then();
        };

        return showButton ? (
            <div data-testid="download-report"
                className="account-dropdown-options"
                onClick={handleDownloadReport}
                onKeyDown={onKeyDown}>
                Download Report
            </div>
        ) : <></>;
    };
    
    const SignOutButton = (): JSX.Element => {
        const clearAccessTokenCookie = (): void => {
            removeToken();
            setRedirect(<Redirect to="/"/>);
        };
        const onKeyDown = (event: React.KeyboardEvent): void => {
            if (event.key === 'Enter') clearAccessTokenCookie();
        };
        
        return (
            <div data-testid="sign-out"
                className="account-dropdown-options"
                onClick={clearAccessTokenCookie}
                onKeyDown={onKeyDown}>
              Sign Out
            </div>
        );  
    };

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
            {dropdownToggle && (
                <div className="dropdown-container">
                    <ShareAccessButton />
                    <DownloadReportButton />
                    <SignOutButton />
                </div>
            )}
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