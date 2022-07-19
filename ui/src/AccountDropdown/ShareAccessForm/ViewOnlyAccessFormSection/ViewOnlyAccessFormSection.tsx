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

import React, {useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import ReactSwitch from 'react-switch';
import SpaceClient from 'Services/Api/SpaceClient';
import MatomoEvents from 'Matomo/MatomoEvents';
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from 'State/CurrentSpaceState';

import './ViewOnlyAccessFormSection.scss';

interface Props {
    collapsed?: boolean;
}

function ViewOnlyAccessFormSection({ collapsed }: Props): JSX.Element {
    const [currentSpace, setCurrentSpace] = useRecoilState(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const isExpanded = !collapsed;
    const [enableViewOnly, setEnableViewOnly] = useState<boolean>(currentSpace.todayViewIsPublic);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const linkToSpace: string = window.location.href;

    const copyLink = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();
        await navigator.clipboard.writeText(linkToSpace);
        setCopiedLink(true);
        MatomoEvents.pushEvent(currentSpace.name, 'readOnlyLinkCopied', '');

        setTimeout(() => {setCopiedLink(false);}, 3000);
    };

    const toggleReadOnlyEnabled = async (checked: boolean): Promise<void> => {
        setEnableViewOnly(checked);
        await SpaceClient.editSpaceReadOnlyFlag(uuid, {...currentSpace, todayViewIsPublic:checked})
            .then((editedSpaceResponse) => setCurrentSpace(editedSpaceResponse.data));
    };

    const viewAccessEnabledMessage = `View only access is ${enableViewOnly ? 'enabled' : 'disabled'}`;
    return (
        <div className="viewOnlyAccessForm form">
            <div className="viewOnlyToggleContainer">
                <label className="viewOnlySwitchLabel">
                    {viewAccessEnabledMessage}
                </label>
                {isExpanded && (
                    <>
                        <ReactSwitch
                            data-testid="viewOnlyAccessToggle"
                            id="viewOnlyAccessToggle"
                            className={enableViewOnly ? '' : 'disabled'}
                            onChange={toggleReadOnlyEnabled}
                            checked={enableViewOnly}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            width={27}
                            height={16}
                            hidden={collapsed}
                            aria-label={viewAccessEnabledMessage}
                        />
                        <i hidden={collapsed}
                            data-testid="viewOnlyAccessTooltip"
                            className="material-icons tooltip sharon-wants-this-one-pixel-larger"
                            data-md-tooltip="Enabling view only allows anyone to view this space for the current day only.
                            Visitors cannot make changes to this space. Visitors have ability to sort & filter.">
                            info
                        </i>
                    </>
                )}
            </div>
            {isExpanded && (
                <div className={`spaceLinkContainer ${enableViewOnly ? '' : 'disabled'}`} hidden={collapsed}>
                    <input
                        className="linkToSpace"
                        data-testid="linkToSpace"
                        value={linkToSpace}
                        type="text"
                        aria-label={linkToSpace}
                        readOnly
                        disabled={!enableViewOnly}
                        data-autoselect=""
                    />
                    <button
                        className="copyLinkButton"
                        data-testid="viewOnlyAccessFormCopyLinkButton"
                        disabled={!enableViewOnly}
                        onClick={copyLink}
                        aria-label="Copy link to clipboard">
                        {copiedLink ? 'Copied!' : 'Copy link'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ViewOnlyAccessFormSection;

