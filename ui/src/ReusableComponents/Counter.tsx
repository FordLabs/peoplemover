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

import {Product} from '../Products/Product';
import React from 'react';

interface CounterProps {
    products: Array<Product>;
}

function Counter(props: CounterProps): JSX.Element {

    const productCount = (): number => {
        return props.products.length - 1;
    };

    const peopleCount = (): number => {
        let peopleCount = new Set();
        props.products.forEach( product => {
            product.assignments.forEach( assignment => {
                peopleCount.add(assignment.person.id);
            });
        });

        return peopleCount.size;
    };

    const unassignedPeopleCount = (): number => {

        let count = 0;
        props.products.forEach( product => {
            if (product.name === 'unassigned') {
                count = product.assignments.length;
            }        
        });
        return count;
    };


    return (
        <span data-testid="counter">Results: {productCount()} Products, {peopleCount()} People ({unassignedPeopleCount()} Unassigned)</span>
    );
}

export default Counter;
