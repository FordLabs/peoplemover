/*!
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
import NewFilter, {FilterTypeEnum} from './NewFilter';
import './NewFilterOrSortBy.scss';

function NewFilterGroup(): JSX.Element {
    return (
        <div className="newDropdownContainer">
            <i className="material-icons indicator-icon" aria-hidden>filter_list</i>
            <span className="dropdown-label">Filter by: </span>
            <NewFilter filterType={FilterTypeEnum.Location}/>
            <NewFilter filterType={FilterTypeEnum.Product}/>
            <NewFilter filterType={FilterTypeEnum.Role}/>
        </div>
    );
}

export default NewFilterGroup;
