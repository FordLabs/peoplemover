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
import {RoleTag} from 'Roles/RoleTag.interface';
import sortTagsAlphabetically from 'Tags/sortTagsAlphabetically';
import {Tag} from 'Tags/Tag';
import {PersonTagsState} from 'State/PersonTagsState';
import PersonTagClient from 'Tags/PersonTag/PersonTagClient';

interface UseFetchPersonTags {
    personTags: Tag[];
    fetchPersonTags(): void
}

function useFetchPersonTags(): UseFetchPersonTags {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const [personTags, setPersonTags] = useRecoilState(PersonTagsState);

    const fetchPersonTags = useCallback(() => {
        PersonTagClient.get(teamUUID)
            .then(result => {
                const tags: Array<RoleTag> = [...result.data];
                sortTagsAlphabetically(tags);
                setPersonTags(tags)
            })
            .catch(console.error);
    }, [setPersonTags, teamUUID])

    return {
        personTags: personTags || [],
        fetchPersonTags
    };
}

export default useFetchPersonTags;