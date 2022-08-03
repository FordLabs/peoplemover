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

import React from 'react';
import {useRecoilValue} from 'recoil';
import {JSX} from '@babel/types';
import TagsModalContent from './TagsModalContent';
import {FilterType, FilterTypeListings} from '../SubHeader/SortingAndFiltering/FilterLibraries';
import ProductTagClient from '../Services/Api/ProductTagClient';
import LocationClient from 'Services/Api/LocationClient';
import PersonTagClient from '../Services/Api/PersonTagClient';
import useFetchLocations from 'Hooks/useFetchLocations/useFetchLocations';
import useFetchPersonTags from 'Hooks/useFetchPersonTags/useFetchPersonTags';
import useFetchProductTags from 'Hooks/useFetchProductTags/useFetchProductTags';
import {UUIDForCurrentSpaceSelector} from '../State/CurrentSpaceState';

import 'Styles/TagRowsContainer.scss';

export const INACTIVE_EDIT_STATE_INDEX = -1;

interface Props {
    filterType: FilterType;
}

function MyTagsForm({ filterType }: Props): JSX.Element {
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

    const { fetchLocations, locations } = useFetchLocations(uuid);
    const { fetchPersonTags, personTags } = useFetchPersonTags(uuid);
    const { fetchProductTags, productTags } = useFetchProductTags(uuid);

    const getWarningMessageElement = (message: string): JSX.Element => (
        <div className="traitWarning">
            <i className="material-icons warningIcon">error</i>
            <p className="warningText">{message}</p>
        </div>
    );

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">
            {filterType === FilterTypeListings.Location &&
            <>
                <TagsModalContent
                    tags={locations}
                    tagClient={LocationClient}
                    filterType={filterType}
                    fetchCommand={fetchLocations}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any product currently tagged with it.')}
            </>
            }
            {filterType === FilterTypeListings.ProductTag &&
            <>
                <TagsModalContent
                    tags={productTags}
                    tagClient={ProductTagClient}
                    filterType={filterType}
                    fetchCommand={fetchProductTags}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any product currently tagged with it.')}
            </>
            }
            {filterType === FilterTypeListings.PersonTag &&
            <>
                <TagsModalContent
                    tags={personTags}
                    tagClient={PersonTagClient}
                    filterType={filterType}
                    fetchCommand={fetchPersonTags}
                />
                {getWarningMessageElement('Editing or deleting a tag will affect any person currently tagged with it.')}
            </>
            }
        </div>
    );
}

export default MyTagsForm;

