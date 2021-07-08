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
import {Space} from '../Space/Space';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import AccountDropdown from '../AccountDropdown/AccountDropdown';
import {Link} from 'react-router-dom';
import './Headers.scss';
import MatomoEvents from '../Matomo/MatomoEvents';
import Flagsmith from 'flagsmith';

interface HeaderProps {
    hideSpaceButtons?: boolean;
    hideAllButtons?: boolean;
    currentSpace: Space;
}

function Header({
    hideSpaceButtons,
    hideAllButtons,
    currentSpace,
}: HeaderProps): JSX.Element {
    const dashboardPathname = '/user/dashboard';
    const logoHref = window.location.pathname === dashboardPathname ? '' : dashboardPathname;
    const spaceName = currentSpace?.name;
    const [timeOnProductClicked, setTimeOnProductClicked] = useState<boolean>(false);
    const [showDropDown, setShowDropDown] = useState<boolean>(!window.location.pathname.includes('error'));
    const showTimeOnProductButton = Flagsmith.hasFeature('show_time_on_product_button');


    /* eslint-disable */
    useEffect( () => {
        setShowDropDown(!window.location.pathname.includes('error'));
    }, [window.location.pathname]);
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
            MatomoEvents.pushEvent(currentSpace.name, 'TimeOnProductClicked', 'Go to Time On Product page');
        } else  {
            MatomoEvents.pushEvent(currentSpace.name, 'TimeOnProductClicked', 'Return to Space from Time On Product page');
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
                    </div>
                    {showTimeOnProductButton && currentSpace && currentSpace.uuid && !timeOnProductClicked && <Link to={`/${currentSpace.uuid}/timeonproduct`} onClick={(): void => sendEventTimeOnProductClick(true)}>Time On Product</Link>}
                    {currentSpace && currentSpace.uuid && timeOnProductClicked && <Link to={`/${currentSpace.uuid}`} onClick={(): void => sendEventTimeOnProductClick(false)}>Back to Space</Link>}
                    {!hideAllButtons && showDropDown && <div className="headerRightContainer">
                        <AccountDropdown hideSpaceButtons={hideSpaceButtons} showAllDropDownOptions={showAllDropDownOptions()}/>
                    </div>
                    }
                </header>
            </>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(Header);
/* eslint-enable */
