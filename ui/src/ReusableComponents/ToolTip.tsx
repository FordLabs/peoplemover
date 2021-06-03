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
    toolTipLabel: string;
    contentElement: JSX.Element;
    onHover?: () => void;
}

const ToolTip = (props: ToolTipProps): JSX.Element => {
    const [isHovering, setIsHovering] = useState<boolean>(false);

    const setHovering = (hoverState: boolean): void => {
        setIsHovering(hoverState);
        if (hoverState && props.onHover) {
            props.onHover();
        }
    };

    return (
        <button onMouseEnter={(): void => setHovering(true)}
            onMouseLeave={(): void => setHovering(false)}
            onFocus={(): void => setHovering(true)}
            onBlur={(): void => setHovering(false)}
            onClick={ (event): void => event.preventDefault()}
            className="toolTipContainer">
            <span className="toolTipLabel">{props.toolTipLabel}</span>
            <div data-testid="toolTipText" className={ isHovering ? 'toolTipHover toolTipHoverShow' : 'toolTipHover toolTipHoverNotShow'}>
                {props.contentElement}
                <b className="toolTipHoverNotchBorder-notch toolTipHoverNotch"/>
                <b className="toolTipHoverNotch"/>
            </div>
        </button>
    );
};

export default ToolTip;
