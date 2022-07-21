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

import SpaceClient from 'Services/Api/SpaceClient';
import {Space} from 'Types/Space';
import {useRecoilState} from 'recoil';
import {UserSpacesState} from 'State/UserSpacesState';
import {useCallback} from 'react';

interface UseFetchUserSpaces {
    userSpaces: Space[];
    fetchUserSpaces(): Promise<void>
}

function useFetchUserSpaces(): UseFetchUserSpaces {
    const [userSpaces, setUserSpaces] = useRecoilState(UserSpacesState);

    const fetchUserSpaces = useCallback(() => {
        return SpaceClient.getSpacesForUser().then(setUserSpaces).catch();
    }, [setUserSpaces])

    return {
        userSpaces: userSpaces || [],
        fetchUserSpaces
    };
}

export default useFetchUserSpaces;