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
import {useParams} from 'react-router-dom';
import {PeopleState} from 'State/PeopleState';
import {Person} from 'People/Person';
import PeopleClient from 'People/PeopleClient';

interface UseFetchPeople {
    people: Person[];
    fetchPeople(): void
}

function useFetchPeople(): UseFetchPeople {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const [people, setPeople] = useRecoilState(PeopleState);

    const fetchPeople = useCallback(() => {
        PeopleClient.getAllPeopleInSpace(teamUUID)
            .then(result => setPeople(result.data || [])).catch(console.error);
    }, [setPeople, teamUUID])

    return {
        people: people || [],
        fetchPeople
    };
}

export default useFetchPeople;