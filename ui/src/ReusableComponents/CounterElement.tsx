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
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {Product} from '../Products/Product';
import './CounterElement.scss';
import {getFilteredCounter} from '../CommonTypes/Counter';

interface CounterElementProps {
    products: Array<Product>;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    viewingDate: Date;
}

function CounterElement(props: CounterElementProps): JSX.Element {

    const filteredCounter = getFilteredCounter(props.products, props.viewingDate, props.allGroupedTagFilterOptions);

    return (
        <div className="counter-container">
            <span className="counter" data-testid="counter">
            Results - Products: {filteredCounter.productCount}, People: {filteredCounter.totalPeopleCount} (Unassigned: {filteredCounter.unassignedPeopleCount})
            </span>
        </div>
    );
}

export default CounterElement;
