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
import * as moment from 'moment';
import { Moment } from 'moment';

export interface Product {
    name: string;
    location: string;
    archived: boolean;
    tags: Array<string>;
    startDate: Moment;
    nextPhaseDate: Moment;
    notes: string;
}

const product: Product = {
    name: 'Automated Test Product',
    location: 'Michigan',
    archived: false,
    tags: ['Tag 1', 'Tag 2'],
    startDate: moment('01/16/2019'),
    nextPhaseDate: moment('01/16/2019').add(1, 'days'),
    notes: 'Product note.',
};

export default product;
