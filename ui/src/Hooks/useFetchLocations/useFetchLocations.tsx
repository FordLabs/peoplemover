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
import sortTagsAlphabetically from 'Tags/sortTagsAlphabetically';
import LocationClient from 'Locations/LocationClient';
import {LocationsState} from 'State/LocationsState';
import {LocationTag} from '../../Types/Tag';

interface UseFetchLocations {
    locations: LocationTag[];
    fetchLocations(): void
}

function useFetchLocations(spaceUUID: string): UseFetchLocations {
    const [locations, setLocations] = useRecoilState(LocationsState);

    const fetchLocations = useCallback(() => {
        LocationClient.get(spaceUUID)
            .then(result => {
                const locationsForSpace: Array<LocationTag> = [...result.data];
                sortTagsAlphabetically(locationsForSpace);
                setLocations(locationsForSpace)
            })
            .catch(console.error);
    }, [setLocations, spaceUUID])

    return {
        locations: locations || [],
        fetchLocations
    };
}

export default useFetchLocations;