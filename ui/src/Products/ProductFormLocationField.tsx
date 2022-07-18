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

import {JSX} from '@babel/types';
import {Option} from '../CommonTypes/Option';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import {LocationTag} from 'Types/LocationTag';
import React, {useEffect, useState} from 'react';
import {Product} from './Product';
import {TagRequest} from '../Tags/TagRequest.interface';
import SelectWithCreateOption, {MetadataReactSelectProps} from '../ModalFormComponents/SelectWithCreateOption';
import {useRecoilValue} from 'recoil';
import {CurrentSpaceState, UUIDForCurrentSpaceSelector} from '../State/CurrentSpaceState';

interface Props {
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product; setCurrentProduct: (updatedProduct: Product) => void };
}

function ProductFormLocationField({
    loadingState: {
        isLoading,
        setIsLoading,
    },
    currentProductState: {
        currentProduct,
        setCurrentProduct,
    },
}: Props): JSX.Element {
    const currentSpace = useRecoilValue(CurrentSpaceState);
    const uuid = useRecoilValue(UUIDForCurrentSpaceSelector);

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
            spaceUuid: currentSpace.uuid ? currentSpace.uuid : '',
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
        <SelectWithCreateOption
            metadata={LOCATION_TAGS}
            value={locationOptionValue()}
            options={locationOptions()}
            onChange={updateSpaceLocations}
            onSave={handleCreateLocationTag}
            isLoading={isLoading}
        />
    );
}

export default ProductFormLocationField;

