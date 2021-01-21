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
import ReactSwitch from 'react-switch';
import SpaceClient from '../Space/SpaceClient';
import {Space} from '../Space/Space';
import {Dispatch} from 'redux';
import {setCurrentSpaceAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';

import './ViewOnlyAccessFormSection.scss';

interface Props {
    currentSpace: Space;
    setCurrentSpace(space: Space): void;
}

function ViewOnlyAccessFormSection({currentSpace, setCurrentSpace}: Props): JSX.Element {
    const [enableReadOnly, setEnableReadOnly] = useState<boolean>(currentSpace.todayViewIsPublic);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const linkToSpace: string = window.location.href;

    const copyLink = async (event: React.MouseEvent): Promise<void> => {
        event.preventDefault();
        await navigator.clipboard.writeText(linkToSpace);
        setCopiedLink(true);

        setTimeout(() => {setCopiedLink(false);}, 3000);
    };


    const toggleReadOnlyEnabled = async (checked: boolean): Promise<void> => {
        setEnableReadOnly(checked);
        await SpaceClient.editSpace(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            currentSpace.uuid!,
            {...currentSpace, todayViewIsPublic:checked},
            currentSpace.name
        ).then((editedSpaceResponse) => setCurrentSpace(editedSpaceResponse.data));
    };
    
    return (
        <div className="viewOnlyAccessForm form">
            <div className="viewOnlyToggleContainer">
                <label htmlFor="viewOnlyAccessToggle" className="readOnlySwitchLabel">
                    View only access is {enableReadOnly ? 'enabled' : 'disabled'}
                </label>
                <ReactSwitch
                    data-testid="viewOnlyAccessToggle"
                    id="viewOnlyAccessToggle"
                    className={enableReadOnly ? '' : 'disabled'}
                    onChange={toggleReadOnlyEnabled}
                    checked={enableReadOnly}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    width={27}
                    height={13}
                />
                <i className="material-icons tooltip"
                    data-md-tooltip="Enabling view only allows anyone to view this space for the current day only.
                    Visitors cannot make changes to this space. Visitors have ability to sort & filter.">
                    info
                </i>
            </div>
            <div className={`spaceLinkContainer ${enableReadOnly ? '' : 'disabled'}`}>
                <span id="copySpaceUrlLinkLabel">
                    People with this link can view only
                </span>
                <div className="copyLinkToShareContainer">
                    <input
                        className="linkToSpace"
                        data-testid="linkToSpace"
                        value={linkToSpace}
                        type="text"
                        aria-label={linkToSpace}
                        readOnly
                        data-autoselect=""
                    />
                    <button 
                        className="copyLinkButton"
                        data-testid="viewOnlyAccessFormCopyLinkButton"
                        disabled={!enableReadOnly}
                        onClick={copyLink}
                        aria-label="Copy link to clipboard">
                        {copiedLink ? 'Copied!' : 'Copy link'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
});

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewOnlyAccessFormSection);
/* eslint-enable */