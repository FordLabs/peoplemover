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
import {useRecoilValue} from 'recoil';
import {Link} from 'react-router-dom';
import Header from 'Common/Header/Header';
import {CurrentSpaceState} from 'State/CurrentSpaceState';

function SpacePageHeader() {
    const currentSpace = useRecoilValue(CurrentSpaceState);

    return (
        <>
            <a href="#main-content-landing-target" className="skipToProducts" data-testid="skipToContentLink">
                Skip to main content
            </a>
            <Header spaceName={currentSpace.name}>
                <Link
                    className="timeOnProductLink"
                    to={`/${currentSpace.uuid}/timeonproduct`}>
                    <span className="newBadge" data-testid="newBadge">BETA</span>Time On Product &#62;
                </Link>
            </Header>
        </>
    )
}

export default SpacePageHeader;