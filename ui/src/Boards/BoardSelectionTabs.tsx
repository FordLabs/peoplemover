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

import React from 'react';
import './BoardSelectionTabs.scss';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../Calendar/Calendar';

interface BoardSelectionTabsProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function BoardSelectionTabs({
    setCurrentModal,
}: BoardSelectionTabsProps): JSX.Element {

    return (
        <div className="boardSelectionContainer">
            <Calendar/>
            <div className="spaceFiller"/>
            <button className="selectionTabButton tab"
                onClick={(): void => setCurrentModal({modal: AvailableModals.MY_TAGS})}
                data-testid="myTagsButton">
                <div className="fas fa-tags myTagsIcon" data-testid="myTagsIcon"/>
                My Tags
            </button>
            <button className="selectionTabButton tab"
                onClick={(): void => setCurrentModal({modal: AvailableModals.MY_ROLES_MODAL})}>
                <div className="fas fa-id-badge myRolesIcon" data-testid="myRolesIcon"/>
                My Roles
            </button>
            <button type="button" className="squareButton createButton"
                onClick={(): void => setCurrentModal({modal: AvailableModals.CREATE_PERSON})}>
                <i className="fa fa-plus fa-sm"/>
                Add Person
            </button>
        </div>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(BoardSelectionTabs);