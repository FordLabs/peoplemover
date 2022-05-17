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
import {connect} from 'react-redux';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from '../Calendar/Calendar';
import {GlobalStateProps} from '../Redux/Reducers';
import ProductSortBy from '../SortingAndFiltering/ProductSortBySelector';
import Filter from '../SortingAndFiltering/Filter';
import NavigationSection from '../ReusableComponents/NavigationSection';
import {FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';

interface Props {
    isReadOnly: boolean;
    showFilters?: boolean;
    showSortBy?: boolean;
    message?: JSX.Element;
}

function SubHeader({ isReadOnly, showFilters = true, showSortBy = true, message = undefined}: Props): JSX.Element {
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
                {message && <>{message}</>}
            </div>
            <div className="rightContent">
                {showFilters && <NavigationSection label="Filter by" icon="filter_list">
                    <Filter filterType={FilterTypeListings.Location}/>
                    <Filter filterType={FilterTypeListings.ProductTag}/>
                    <Filter filterType={FilterTypeListings.PersonTag}/>
                    <Filter filterType={FilterTypeListings.Role}/>
                </NavigationSection>}
                {showSortBy && <ProductSortBy/>}
            </div>
        </section>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    isReadOnly: state.isReadOnly,
});

export default connect(mapStateToProps)(SubHeader);
/* eslint-enable */
