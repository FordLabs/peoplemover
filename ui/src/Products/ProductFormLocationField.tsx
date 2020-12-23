/*
 * Copyright (c) 2020 Ford Motor Company
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

import {JSX} from '@babel/types';
import {connect} from 'react-redux';
import {Option} from '../CommonTypes/Option';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import {LocationTag} from '../Locations/LocationTag.interface';
import {Tag} from '../Tags/Tag.interface';
import React, {useEffect, useState} from 'react';
import {Product} from './Product';
import {Space} from '../Space/Space';
import {GlobalStateProps} from '../Redux/Reducers';
import {TagRequest} from '../Tags/TagRequest.interface';
import ReactSelect, {MetadataReactSelectProps} from '../ModalFormComponents/ReactSelect';

interface Props {
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product; setCurrentProduct: (updatedProduct: Product) => void };
    spaceId: number;
    addGroupedTagFilterOptions: (tagFilterIndex: number, trait: Tag) => void;
    currentSpace: Space;
}

function ProductFormLocationField({
    spaceId,
    loadingState: {
        isLoading,
        setIsLoading,
    },
    currentProductState: {
        currentProduct,
        setCurrentProduct,
    },
    currentSpace,
    addGroupedTagFilterOptions,
}: Props): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uuid = currentSpace.uuid!;
    const { LOCATION_TAGS } = MetadataReactSelectProps;
    const [availableLocations, setAvailableLocations] = useState<LocationTag[]>([]);

    useEffect(() => {
        LocationClient.get(uuid)
            .then(result => {
                setAvailableLocations(result.data);
            });
    }, [uuid]);

    function optionToSpaceLocation(option: Option): LocationTag {
        return {
            id: Number.parseInt(option.value.split('_')[0], 10),
            name: option.label,
            spaceId,
        };
    }

    function createLocationOption(location: LocationTag): Option {
        return {
            label: location.name,
            value: location.id ? location.id.toString() : '',
        };
    }

    function locationOptionValue(): Option | undefined {
        const { spaceLocation } = currentProduct;
        if (spaceLocation && spaceLocation.name !== '') {
            return createLocationOption(spaceLocation);
        }
        return undefined;
    }

    function locationOptions(): Option[] {
        return availableLocations.map(createLocationOption);
    }

    function handleCreateLocationTag(inputValue: string): void {
        setIsLoading(true);

        const location: TagRequest = {
            name: inputValue,
        };
        LocationClient.add(location, currentSpace).then((result: AxiosResponse) => {
            const newLocation: LocationTag = result.data;
            setAvailableLocations([...availableLocations, newLocation]);
            addGroupedTagFilterOptions(0, newLocation as Tag);
            setCurrentProduct({
                ...currentProduct,
                spaceLocation: newLocation,
            });
            setIsLoading(false);
        });
    }

    function updateSpaceLocations(option: Option): void {
        const updatedProduct: Product = {
            ...currentProduct,
            spaceLocation: option ? optionToSpaceLocation(option) : undefined,
        };
        setCurrentProduct(updatedProduct);
    }

    return (
        <ReactSelect
            metadata={LOCATION_TAGS}
            value={locationOptionValue()}
            options={locationOptions()}
            onChange={updateSpaceLocations}
            onSave={handleCreateLocationTag}
            isLoading={isLoading}
        />
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormLocationField);
/* eslint-enable */
