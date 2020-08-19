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

import {Space} from './Space';
import * as React from 'react';
import moment, {now} from 'moment';
import './SpaceDashboardTile.scss';

interface SpaceDashboardTileProps {
    space: Space;
    onClick: (space: Space) => void;
}

export default function SpaceDashboardTile({space, onClick}: SpaceDashboardTileProps): JSX.Element {
    let timestamp: string;
    const nowStamp = now();
    const lastModifiedMoment = moment(space.lastModifiedDate);
    if (lastModifiedMoment.isSame(nowStamp, 'day')) {
        timestamp = lastModifiedMoment.format('[today at] h:mm a');
    } else {
        timestamp = lastModifiedMoment.format('dddd, MMMM D, YYYY [at] h:mm a');
    }

    return (
        <button className="space" onClick={(): void => onClick(space)}>
            <div className="space-name">{space.name}</div>
            <div className="last-modified-text">Last modified {timestamp}</div>
        </button>
    );
}