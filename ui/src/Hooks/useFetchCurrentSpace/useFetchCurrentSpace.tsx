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
import {useNavigate} from 'react-router-dom';
import SpaceClient from '../../Space/SpaceClient';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';
import {Space} from 'Types/Space';
import {AxiosError} from 'axios';

const BAD_REQUEST = 400;
const FORBIDDEN = 403;

interface UseFetchCurrentSpace {
    currentSpace: Space;
    fetchCurrentSpace(): void
}

function useFetchCurrentSpace(spaceUUID: string): UseFetchCurrentSpace {
    const navigate = useNavigate();

    const [currentSpace, setCurrentSpace] = useRecoilState(CurrentSpaceState);

    const handleErrors = useCallback((error: AxiosError): Error | null => {
        if (error?.response?.status === BAD_REQUEST) {
            navigate("/error/404");
            return null;
        } else if (error?.response?.status === FORBIDDEN) {
            navigate("/error/403");
            return null;
        } else {
            return error;
        }
    }, [navigate]);

    const fetchCurrentSpace = useCallback(() => {
        SpaceClient.getSpaceFromUuid(spaceUUID)
            .then(result => setCurrentSpace(result.data))
            .catch(handleErrors);
    }, [handleErrors, setCurrentSpace, spaceUUID])

    return {
        currentSpace: currentSpace || [],
        fetchCurrentSpace
    };
}

export default useFetchCurrentSpace;