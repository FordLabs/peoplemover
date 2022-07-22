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

import React, {useState} from 'react';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import AccountDropdown from '../AccountDropdown/AccountDropdown';
import {Link, useLocation} from 'react-router-dom';
import MatomoService from '../Services/MatomoService';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from '../State/CurrentSpaceState';
import {dashboardUrl} from '../Routes';

import './Headers.scss';

interface HeaderProps {
    hideSpaceButtons?: boolean;
    hideAllButtons?: boolean;
}

function Header({ hideSpaceButtons, hideAllButtons }: HeaderProps): JSX.Element {
    const location = useLocation();

    const currentSpace = useRecoilValue(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const [timeOnProductClicked, setTimeOnProductClicked] = useState<boolean>(location.pathname.includes('timeonproduct'));

    const logoHref = location.pathname === dashboardUrl ? '' : dashboardUrl;
    const spaceName = currentSpace?.name;

    const showAllDropDownOptions = (): boolean => {
        return (location.pathname !== dashboardUrl);
    };

    const hideHeader = (): boolean => {
        return (location.pathname === '/');
    };

    const showDropdown = () => {
        return !location.pathname.includes('error')
    }
    
    const sendEventTimeOnProductClick = (clicked: boolean): void => {
        setTimeOnProductClicked(clicked);
        if (clicked) {
            MatomoService.pushEvent(spaceName, 'TimeOnProductClicked', 'Go to Time On Product page');
        } else  {
            MatomoService.pushEvent(spaceName, 'TimeOnProductClicked', 'Return to Space from Time On Product page');
        }
    };

    return (
        hideHeader() ? <></>
            : <>
                {uuid && !timeOnProductClicked && (
                    <a href="#main-content-landing-target" className="skipToProducts" data-testid="skipToContentLink">
                        Skip to main content
                    </a>
                )}
                <header className="peopleMoverHeader" data-testid="peopleMoverHeader">
                    <div className="headerLeftContainer">
                        <PeopleMoverLogo href={logoHref}/>
                        {spaceName && <h1 className="spaceName">{spaceName}</h1>}
                        {uuid && !timeOnProductClicked && (
                            <Link
                                className="timeOnProductLink"
                                to={`/${uuid}/timeonproduct`}
                                onClick={(): void => sendEventTimeOnProductClick(true)}>
                                <span className="newBadge" data-testid="newBadge">BETA</span>Time On Product &#62;
                            </Link>
                        )}
                        {uuid && timeOnProductClicked && (
                            <Link
                                className="timeOnProductLink"
                                to={`/${uuid}`}
                                onClick={(): void => sendEventTimeOnProductClick(false)}>
                                &#60; Back
                            </Link>
                        )}
                    </div>
                    {!hideAllButtons && showDropdown() && (
                        <div className="headerRightContainer">
                            <AccountDropdown
                                hideSpaceButtons={hideSpaceButtons}
                                showAllDropDownOptions={showAllDropDownOptions()}/>
                        </div>
                    )}
                </header>
            </>
    );
}

export default Header;
