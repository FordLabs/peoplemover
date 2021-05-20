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
import './SubHeader.scss';
import {setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../Calendar/Calendar';
import {GlobalStateProps} from '../Redux/Reducers';
import ProductSortBy from '../SortingAndFiltering/ProductSortBy';
import Filter from '../SortingAndFiltering/Filter';
import NavigationSection from '../ReusableComponents/NavigationSection';
import {FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';

interface Props {
    isReadOnly: boolean;
    setCurrentModal(modalState: CurrentModalState): void;
}

function SubHeader({ isReadOnly, setCurrentModal }: Props): JSX.Element {
    return (
        <section className="newSpaceSelectionContainer" aria-label="Filters">
            <div className="leftContent">
                <Calendar/>
                {isReadOnly && (
                    <span className="viewState">
                        <i className="material-icons">visibility</i>
                        View only
                    </span>
                )}
            </div>
            <div className="rightContent">
                <NavigationSection label="Filter by" icon="filter_list">
                    <Filter filterType={FilterTypeListings.Location}/>
                    <Filter filterType={FilterTypeListings.ProductTag}/>
                    <Filter filterType={FilterTypeListings.PersonTag}/>
                    <Filter filterType={FilterTypeListings.Role}/>
                </NavigationSection>
                <ProductSortBy/>
            </div>
        </section>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isReadOnly: state.isReadOnly,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SubHeader);
/* eslint-enable */
