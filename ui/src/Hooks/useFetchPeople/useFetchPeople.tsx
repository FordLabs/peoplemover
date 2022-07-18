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

import {useRecoilState} from 'recoil';
import {useCallback} from 'react';
import {PeopleState} from 'State/PeopleState';
import PeopleClient from 'People/PeopleClient';
import {Person} from 'Types/Person';

interface UseFetchPeople {
    people: Person[];
    fetchPeople(): void
}

function useFetchPeople(spaceUUID: string): UseFetchPeople {
    const [people, setPeople] = useRecoilState(PeopleState);

    const fetchPeople = useCallback(() => {
        PeopleClient.getAllPeopleInSpace(spaceUUID)
            .then(result => setPeople(result.data || [])).catch(console.error);
    }, [setPeople, spaceUUID])

    return {
        people: people || [],
        fetchPeople
    };
}

export default useFetchPeople;