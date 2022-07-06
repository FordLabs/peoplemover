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

import InviteEditorsFormSection from './InviteEditorsFormSection/InviteEditorsFormSection';
import React, {useState} from 'react';
import {Space} from '../../Space/Space';
import {GlobalStateProps} from '../../Redux/Reducers';
import {connect} from 'react-redux';
import MultiModalCardBanner from '../../Modal/MultiModalCardBanner/MultiModalCardBanner';
import ViewOnlyAccessFormSection from './ViewOnlyAccessFormSection/ViewOnlyAccessFormSection';

import './ShareAccessForm.scss';
import {useSetRecoilState} from 'recoil';
import {ModalContentsState} from '../../State/ModalContentsState';

interface Props {
    currentSpace: Space;
}

function ShareAccessForm({ currentSpace }: Props) {
    const [isFirstSectionCollapsed, setIsFirstSectionCollapsed] = useState<boolean>(false);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const closeModal = () => setModalContents(null);

    return (
        <div className="share-access-form">
            <div className="form-container" data-testid="modalCard" aria-expanded={!isFirstSectionCollapsed}>
                <MultiModalCardBanner
                    title="Invite others to view"
                    collapsed={isFirstSectionCollapsed}
                    onCloseBtnClick={closeModal}
                    onClick={() => setIsFirstSectionCollapsed(false)}
                />
                <ViewOnlyAccessFormSection collapsed={isFirstSectionCollapsed}/>
            </div>
            <div className="form-container" data-testid="modalCard" aria-expanded={isFirstSectionCollapsed}>
                <MultiModalCardBanner
                    title="Invite others to edit"
                    collapsed={!isFirstSectionCollapsed}
                    onCloseBtnClick={closeModal}
                    onClick={() => setIsFirstSectionCollapsed(true)}
                />
                <InviteEditorsFormSection
                    space={currentSpace}
                    collapsed={!isFirstSectionCollapsed}
                />
            </div>
        </div>
    )
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ShareAccessForm);
/* eslint-enable */