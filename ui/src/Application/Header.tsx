/*
 * Copyright (c) 2019 Ford Motor Company
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

import SpaceButtons from '../Spaces/SpaceButtons';
import React from 'react';

interface HeaderProps {
    hideSpaceButtons?: boolean;
    hideAllButtons?: boolean;
}

function Header({hideSpaceButtons, hideAllButtons}: HeaderProps): JSX.Element {
    return (
        <header>
            <div className="logo-title-container">
                <img
                    src={require('./Assets/logo.svg')}
                    alt="Logo not available"/>
                <h1 className="page-title">PEOPLEMOVER</h1>
            </div>

            {!hideAllButtons && <SpaceButtons hideSpaceButtons={hideSpaceButtons}/>}

        </header>
    );
}

export default Header;
