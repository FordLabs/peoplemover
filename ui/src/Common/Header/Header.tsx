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

import React, {ReactChild} from 'react';
import PeopleMoverLogo from 'Common/PeopleMoverLogo/PeopleMoverLogo';
import AccountDropdown from './AccountDropdown/AccountDropdown';
import {dashboardUrl} from '../../Routes';

import './Headers.scss';

interface HeaderProps {
    spaceName?: string;
    showStaticPeopleMoverLogo?: boolean;
    hideAccountDropdown?: boolean;
    onlyShowSignOutButton?: boolean
    children?: ReactChild;
}

function Header({
    spaceName,
    showStaticPeopleMoverLogo,
    hideAccountDropdown,
    onlyShowSignOutButton,
    children
}: HeaderProps): JSX.Element {
    const logoLink = showStaticPeopleMoverLogo ? '' : dashboardUrl;

    return  (
        <header className="peopleMoverHeader" data-testid="peopleMoverHeader">
            <div className="headerLeftContainer">
                <PeopleMoverLogo href={logoLink}/>
                {spaceName && (
                    <h1 className="spaceName" data-testid="headerSpaceName">
                        {spaceName}
                    </h1>
                )}
                {children}
            </div>
            {!hideAccountDropdown && (
                <div className="headerRightContainer">
                    <AccountDropdown showAllDropDownOptions={!onlyShowSignOutButton}/>
                </div>
            )}
        </header>
    );
}

export default Header;
