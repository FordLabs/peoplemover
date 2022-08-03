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
import Calendar from './Calendar/Calendar';
import ProductSortBySelector from './ProductSortBySelector/ProductSortBySelector';
import NavigationSection from './NavigationSection/NavigationSection';
import {useRecoilValue} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import ProductLocationFilter from './SortingAndFiltering/ProductLocationFilter/ProductLocationFilter';
import ProductTagsFilter from './SortingAndFiltering/ProductTagsFilter/ProductTagsFilter';
import PersonTagsFilter from './SortingAndFiltering/PersonTagsFilter/PersonTagsFilter';
import RolesFilter from './SortingAndFiltering/RolesFilter/RolesFilter';

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
        <div className="sub-header">
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
                            <ProductLocationFilter />
                            <ProductTagsFilter />
                            <PersonTagsFilter />
                            <RolesFilter />
                        </NavigationSection>
                    )}
                    {showSortBy && <ProductSortBySelector/>}
                </div>
            </section>
        </div>
    );
}

export default SubHeader;
