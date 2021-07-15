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
import React, {useState} from 'react';
import './HoverableIcon.scss';

interface HoverableIconProps {
    textToDisplay: string[];
    iconeName: string;
    viewOnly: boolean;
    isDragging: boolean;
    isUnassignedProduct: boolean;
}

const HoverableIcon = ({
    textToDisplay,
    iconeName,
    viewOnly,
    isDragging,
    isUnassignedProduct,
}: HoverableIconProps): JSX.Element => {
    const [hoverBoxIsOpened, setHoverBoxIsOpened] = useState<boolean>(false);
    const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout>();

    const onHover = (boxIsHovered = false): void => {
        setHoverBoxIsOpened(boxIsHovered);
        //
        // if (boxIsHovered) {
        //     const timeout = setTimeout(() => {
        //         setHoverBoxIsOpened(boxIsHovered);
        //     }, 500);
        //
        //     setHoverTimeout(timeout);
        // } else {
        //     setHoverBoxIsOpened(boxIsHovered);
        //     if (hoverTimeout) clearTimeout(hoverTimeout);
        // }
    };

    const HoverBox = (): JSX.Element => {
        return (
            <div className={`hoverBoxContainer ${isUnassignedProduct ? 'unassignedHoverBoxContainer' : ''}`}
                data-testid="hoverBoxContainer">
                <p className="hoverBoxText">
                    {textToDisplay.toString()}
                </p>
            </div>
        );
    };

    return !viewOnly && textToDisplay.length !== 0 ? (
            <i className={`material-icons hoverableIcon ${isUnassignedProduct ? 'unassignedHoverableIcon' : ''}`}
                data-testid="tagIcon"
                onMouseEnter={(): void => onHover(true)}
                onMouseLeave={(): void => onHover(false)}
            >style
                {!isDragging && hoverBoxIsOpened && <HoverBox/>}
            </i>
    ) : <></>;
};

export default (HoverableIcon);
