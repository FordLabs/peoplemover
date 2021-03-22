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

import React from 'react';
import './NewSubHeader.scss';
import {setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import 'react-datepicker/dist/react-datepicker.css';
import NewCalendar from '../Calendar/NewCalendar';
import {GlobalStateProps} from '../Redux/Reducers';
import NewProductSortBy from '../SortingAndFiltering/NewProductSortBy';
import NewFilter from '../SortingAndFiltering/NewFilter';
import NavigationSection from '../ReusableComponents/NavigationSection';
import {FilterTypeListings} from '../SortingAndFiltering/FilterConstants';
import {AvailableModals} from '../Modal/AvailableModals';

interface Props {
    isReadOnly: boolean;
    setCurrentModal(modalState: CurrentModalState): void;
}

/*

THIS COMMENT NEEDS TO BE DELETED!

BUT! Before it gets deleted, the New UI needs to go
live. Then the '#newui' hash can be removed, along with
where it appears in tests.

Then, this file needs to be renamed to SubHeader
(along with the corresponding scss)

As a BONUS, the SpaceSelectionTabs.tsx file (and corresponding scss) can be
deleted, as well

 */
function NewSubHeader({ isReadOnly, setCurrentModal }: Props): JSX.Element {
    return (
        <div className="newSpaceSelectionContainer">
            <div className="leftContent">
                <NewCalendar/>
                {isReadOnly && (
                    <span className="viewState">
                        <i className="material-icons">visibility</i>
                        View only
                    </span>
                )}
            </div>
            {isReadOnly ? <></> : <div className="rightContent">
                <NavigationSection label="Filter by" icon="filter_list">
                    <NewFilter filterType={FilterTypeListings.Location}/>
                    <NewFilter filterType={FilterTypeListings.ProductTag}/>
                    <NewFilter filterType={FilterTypeListings.Role}/>
                </NavigationSection>
                <button
                    className={`selectionTabButton tab`}
                    onClick={(): void => setCurrentModal({modal: AvailableModals.MY_TAGS})}
                    data-testid="myTagsButton">
                    <i className="material-icons myTagsIcon" aria-hidden data-testid="myTagsIcon">local_offer</i>
                    My Tags
                </button>
                <button
                    className={`selectionTabButton tab`}
                    data-testid="myRolesButton"
                    onClick={(): void => setCurrentModal({modal: AvailableModals.MY_ROLES_MODAL})}>
                    <i className="material-icons myRolesIcon" aria-hidden data-testid="myRolesIcon">assignment_ind</i>
                    My Roles
                </button>
                <NewProductSortBy/>
            </div>}
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewSubHeader);
/* eslint-enable */
