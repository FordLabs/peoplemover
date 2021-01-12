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

import React from 'react';
import './Branding.scss';
import FordLabsLogo from '../Application/Assets/fordlabs_logo.svg';

function Branding(): JSX.Element {
    const fordLabsUrl = window?.runConfig?.ford_labs_url || '';
    return (
        <div className="brandingContainer"
            aria-label="Powered by Ford Labs">
            <span className="brandingMessage">Powered by</span>
            <img className="brandingImage"
                src={FordLabsLogo}
                alt=""
                aria-hidden
                width="20"
                height="20"/>
            <a target="_blank"
                href={fordLabsUrl}
                className="brandingMessage">
                FordLabs
            </a>
        </div>
    );
}

export default Branding;
