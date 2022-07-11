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

import React from 'react';
import Calendar from '../Calendar/Calendar';
import ProductSortBy from '../SortingAndFiltering/ProductSortBySelector';
import Filter from '../SortingAndFiltering/Filter';
import NavigationSection from '../ReusableComponents/NavigationSection';
import {FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import {useRecoilValue} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import MyTagsForm from '../Tags/MyTagsForm';
import MyRolesForm from '../Roles/MyRolesForm';

import 'react-datepicker/dist/react-datepicker.css';
import './SubHeader.scss';

interface Props {
    showFilters?: boolean;
    showSortBy?: boolean;
    message?: JSX.Element;
}

function SubHeader({ showFilters = true, showSortBy = true, message = undefined}: Props): JSX.Element {
    const isReadOnly = useRecoilValue(IsReadOnlyState);

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
                {showFilters && (
                    <NavigationSection label="Filter by" icon="filter_list">
                        <Filter filterType={FilterTypeListings.Location} modalContents={{
                            title: 'Product Location',
                            component: <MyTagsForm filterType={FilterTypeListings.Location}/>}
                        }/>
                        <Filter filterType={FilterTypeListings.ProductTag} modalContents={{
                            title: 'Product Tags',
                            component: <MyTagsForm filterType={FilterTypeListings.ProductTag}/>
                        }}/>
                        <Filter filterType={FilterTypeListings.PersonTag} modalContents={{
                            title: 'Person Tags',
                            component: <MyTagsForm filterType={FilterTypeListings.PersonTag}/>
                        }}/>
                        <Filter filterType={FilterTypeListings.Role} modalContents={{
                            title: 'My Roles', component: <MyRolesForm/>
                        }}/>
                    </NavigationSection>
                )}
                {showSortBy && <ProductSortBy/>}
            </div>
        </section>
    );
}

export default SubHeader;
