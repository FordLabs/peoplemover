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

import React from 'react';

import './UnsupportedBrowserPage.scss';
import Chrome from './chrome.png';
import FireFox from './firefox.png';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import Branding from '../ReusableComponents/Branding';

interface UnsupportedBrowserProps {
    browserName: string;
}

function UnsupportedBrowserPage({browserName}: UnsupportedBrowserProps): JSX.Element {

    return (
        <div className="unsupported-browser-container">
            <div className="peoplemover-logo">
                <PeopleMoverLogo />
            </div>
            <div className="unsupported-browser-text">
                We&apos;re sorry, but PeopleMover is not currently optimized for {browserName}. <br/><br/>Please use Chrome
                <img className="unsupported-browser-img" src={Chrome} alt="Chrome Logo"/> or Firefox
                <img className="unsupported-browser-img" src={FireFox} alt="FireFox Logo"/>
            </div>
            <Branding />
        </div>
    );
}
export default UnsupportedBrowserPage;
