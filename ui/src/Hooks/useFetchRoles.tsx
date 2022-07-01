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
import RoleClient from '../Roles/RoleClient';
import {RolesState} from '../State/RolesState';
import {RoleTag} from '../Roles/RoleTag.interface';
import sortTagsAlphabetically from '../Tags/sortTagsAlphabetically';

interface UseFetchRoles {
    roles: RoleTag[];
    fetchRoles(): void
}

function useFetchRoles(): UseFetchRoles {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const [roles, setRoles] = useRecoilState(RolesState);

    const fetchRoles = useCallback(() => {
        RoleClient.get(teamUUID)
            .then(result => {
                const roles: Array<RoleTag> = [...result.data];
                sortTagsAlphabetically(roles);
                setRoles(roles)
            })
            .catch(console.error);
    }, [setRoles, teamUUID])

    return {
        roles: roles || [],
        fetchRoles
    };
}

export default useFetchRoles;