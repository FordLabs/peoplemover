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

import {AvailableActions} from '../Actions';
import {Person} from '../../People/Person';

const peopleReducer = (state: Array<Person> = [], action: {type: AvailableActions; people: Array<Person>}): Array<Person> => {
    switch (action.type) {
    case AvailableActions.ADD_PERSON:
        return [
            ...state,
            action.people[0],
        ];
    case AvailableActions.EDIT_PERSON:
        return state.map((person) => {
            if (person.id === action.people[0].id) {
                return action.people[0];
            }
            return person;
        });
    case AvailableActions.SET_PEOPLE:
        return action.people;
    default:
        return state;
    }
};

export default peopleReducer;
