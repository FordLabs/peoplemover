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
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import AccountDropdown from '../AccountDropdown/AccountDropdown';
import {Link} from 'react-router-dom';
import MatomoService from '../Services/MatomoService';

import './Headers.scss';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

interface HeaderProps {
    hideSpaceButtons?: boolean;
    hideAllButtons?: boolean;
}

function Header({ hideSpaceButtons, hideAllButtons }: HeaderProps): JSX.Element {
    const currentSpace = useRecoilValue(CurrentSpaceState);

    const dashboardPathname = '/user/dashboard';
    const logoHref = window.location.pathname === dashboardPathname ? '' : dashboardPathname;
    const spaceName = currentSpace?.name;
    const [timeOnProductClicked, setTimeOnProductClicked] = useState<boolean>(false);
    const [showDropDown, setShowDropDown] = useState<boolean>(!window.location.pathname.includes('error'));

    const useReactPath = (): string => {
        const [reactPath, setReactPath] = useState(window.location.pathname);
        const listenToPopstate = (): void => {
            setReactPath(window.location.pathname);
        };
        useEffect(() => {
            window.addEventListener('popstate', listenToPopstate);
            return (): void => {
                window.removeEventListener('popstate', listenToPopstate);
            };
        }, []);
        return reactPath;
    };

    const path = useReactPath();

    /* eslint-disable */
    useEffect( () => {
        setShowDropDown(!window.location.pathname.includes('error'));
        if(window.location.pathname.includes('timeonproduct')) {
            setTimeOnProductClicked(true);
        } else {
            setTimeOnProductClicked(false);
        }
    }, [window.location.pathname, path]);
    /* eslint-enable */

    const showAllDropDownOptions = (): boolean => {
        return (window.location.pathname !== dashboardPathname);
    };

    const showHeader = (): boolean => {
        return (window.location.pathname === '/');
    };
    
    const sendEventTimeOnProductClick = (clicked: boolean): void => {
        setTimeOnProductClicked(clicked);
        if (clicked) {
            MatomoService.pushEvent(currentSpace.name, 'TimeOnProductClicked', 'Go to Time On Product page');
        } else  {
            MatomoService.pushEvent(currentSpace.name, 'TimeOnProductClicked', 'Return to Space from Time On Product page');
        }
    };

    return (
        showHeader() ? <></>
            : <>
                {currentSpace && currentSpace.uuid && !timeOnProductClicked && <a href="#main-content-landing-target" className="skipToProducts" data-testid="skipToContentLink">Skip to
                    main content</a>}
                <header className="peopleMoverHeader">
                    <div className="headerLeftContainer">
                        <PeopleMoverLogo href={logoHref}/>
                        {spaceName && <h1 className="spaceName">{spaceName}</h1>}
                        {currentSpace && currentSpace.uuid && !timeOnProductClicked && <Link className="timeOnProductLink" to={`/${currentSpace.uuid}/timeonproduct`} onClick={(): void => sendEventTimeOnProductClick(true)}><span className="newBadge" data-testid="newBadge">BETA</span>Time On Product &#62;</Link>}
                        {currentSpace && currentSpace.uuid && timeOnProductClicked && <Link className="timeOnProductLink" to={`/${currentSpace.uuid}`} onClick={(): void => sendEventTimeOnProductClick(false)}>&#60; Back</Link>}
                    </div>
                    {!hideAllButtons && showDropDown && <div className="headerRightContainer">
                        <AccountDropdown hideSpaceButtons={hideSpaceButtons} showAllDropDownOptions={showAllDropDownOptions()}/>
                    </div>
                    }
                </header>
            </>
    );
}

export default Header;
