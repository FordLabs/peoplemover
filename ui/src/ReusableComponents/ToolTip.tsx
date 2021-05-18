/*
 *   Copyright (c) 2021 Ford Motor Company
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React from 'react';
import './ToolTip.scss';

interface ToolTipProps {
    contentText: JSX.Element;
}

const ToolTip = (props: ToolTipProps): JSX.Element => {
    return (
        <div className="whatIsThisContainer">
            <span className="whatIsThisLabel">What&apos;s This?</span>
            <div className="whatIsThisHover">
                {props.contentText}
                <b className="whatIsThisHoverNotchBorder-notch whatIsThisHoverNotch"/>
                <b className="whatIsThisHoverNotch"/>
            </div>
        </div>
    );
};

export default ToolTip;
