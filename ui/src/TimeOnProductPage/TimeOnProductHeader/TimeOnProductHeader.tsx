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
import Header from '../../Header/Header';
import {Link} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';
import {dashboardUrl} from '../../Routes';

function TimeOnProductHeader() {
    const currentSpace = useRecoilValue(CurrentSpaceState);

    return (
        <Header spaceName={currentSpace.name} peopleMoverLogoUrl={dashboardUrl}>
            <Link
                className="timeOnProductLink"
                to={`/${currentSpace.uuid}`}>
                &#60; Back
            </Link>
        </Header>
    )
}

export default TimeOnProductHeader;