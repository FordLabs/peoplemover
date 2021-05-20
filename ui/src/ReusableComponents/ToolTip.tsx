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

import React, {useState} from 'react';
import './ToolTip.scss';

interface ToolTipProps {
    contentText: JSX.Element;
}

const ToolTip = (props: ToolTipProps): JSX.Element => {
    const [isHovering, setIsHovering] = useState<boolean>(false);


    return (
        <button onMouseOver={(): void => setIsHovering(true)}
            onMouseLeave={(): void => setIsHovering(false)}
            onFocus={(): void => setIsHovering(true)}
            onBlur={(): void => setIsHovering(false)}
            onClick={ (event): void => event.preventDefault()}
            className="whatIsThisContainer">
            <span className="whatIsThisLabel">What&apos;s this?</span>
            <div data-testid="whatIsThisTip" className={ isHovering ? 'whatIsThisHover whatIsThisHoverShow' : 'whatIsThisHover whatIsThisHoverNotShow'}>
                {props.contentText}
                <b className="whatIsThisHoverNotchBorder-notch whatIsThisHoverNotch"/>
                <b className="whatIsThisHoverNotch"/>
            </div>
        </button>
    );
};

export default ToolTip;