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

import React from 'react';
import PeopleMoverLogo from '../Common/PeopleMoverLogo/PeopleMoverLogo';
import AccountDropdown from './AccountDropdown/AccountDropdown';
import {Link, useLocation} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from '../State/CurrentSpaceState';
import {contactUsPath, dashboardUrl} from '../Routes';

import './Headers.scss';

function Header(): JSX.Element {
    const location = useLocation();

    const currentSpace = useRecoilValue(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const isTimeOnProductPage = location.pathname.includes('timeonproduct');
    const isSpacePage = location.pathname === `/${uuid}`;
    const isLandingPage = location.pathname === '/';
    const isErrorPage = location.pathname.includes('error');
    const isDashboardPage = location.pathname === dashboardUrl;
    const isContactUsPage = location.pathname === contactUsPath;

    const spaceName = currentSpace?.name;

    function showSpaceName(): boolean {
        return (isSpacePage || isTimeOnProductPage) && !!spaceName;
    }

    return (
        isLandingPage ? <></>
            : <>
                {isSpacePage && (
                    <a href="#main-content-landing-target" className="skipToProducts" data-testid="skipToContentLink">
                        Skip to main content
                    </a>
                )}
                <header className="peopleMoverHeader" data-testid="peopleMoverHeader">
                    <div className="headerLeftContainer">
                        <PeopleMoverLogo href={isDashboardPage ? '' : dashboardUrl}/>
                        {showSpaceName() && <h1 className="spaceName">{spaceName}</h1>}
                        {isSpacePage && (
                            <Link
                                className="timeOnProductLink"
                                to={`/${uuid}/timeonproduct`}>
                                <span className="newBadge" data-testid="newBadge">BETA</span>Time On Product &#62;
                            </Link>
                        )}
                        {isTimeOnProductPage && (
                            <Link
                                className="timeOnProductLink"
                                to={`/${uuid}`}>
                                &#60; Back
                            </Link>
                        )}
                    </div>
                    {!isErrorPage && (
                        <div className="headerRightContainer">
                            <AccountDropdown showAllDropDownOptions={!isDashboardPage && !isContactUsPage}/>
                        </div>
                    )}
                </header>
            </>
    );
}

export default Header;
