import {JSX} from '@babel/types';
import {connect} from 'react-redux';
import {Option} from '../CommonTypes/Option';
import {TraitAddRequest} from '../Traits/TraitAddRequest';
import LocationClient from '../Locations/LocationClient';
import {AxiosResponse} from 'axios';
import {SpaceLocation} from '../Locations/SpaceLocation';
import {Trait} from '../Traits/Trait';
import Creatable from 'react-select/creatable';
import {CreateNewText, CustomIndicator, CustomOption} from '../ReusableComponents/ReactSelectStyles';
import React, {useEffect, useState} from 'react';
import {Product} from './Product';
import {Space} from '../SpaceDashboard/Space';
import {GlobalStateProps} from '../Redux/Reducers';
import {customStyles} from './ProductForm';

interface Props {
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product; setCurrentProduct: (updatedProduct: Product) => void };
    spaceId: number;
    addGroupedTagFilterOptions: (tagFilterIndex: number, trait: Trait) => void;
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
    const [availableLocations, setAvailableLocations] = useState<SpaceLocation[]>([]);
    const [typedInLocation, setTypedInLocation] = useState<string>('');

    useEffect(() => {
        LocationClient.get(currentSpace.name)
            .then(result => {
                setAvailableLocations(result.data);
            });
    }, []);

    function optionToSpaceLocation(option: Option): SpaceLocation {
        return {
            id: Number.parseInt(option.value.split('_')[0], 10),
            name: option.label,
            spaceId,
        };
    }

    function createLocationOption(location: SpaceLocation): Option {
        return {
            label: location.name,
            value: location.id!.toString(),
        };
    }

    function locationOptionValue(): Option | undefined {
        if (currentProduct.spaceLocation && currentProduct.spaceLocation.name !== '') {
            return createLocationOption(currentProduct.spaceLocation);
        }
        return undefined;
    }

    function locationOptions(): Option[] {
        return availableLocations.map(location => createLocationOption(location));
    }

    function handleCreateLocationTag(inputValue: string): void {
        setIsLoading(true);

        const location: TraitAddRequest = {
            name: inputValue,
        };
        LocationClient.add(location, currentSpace.name).then((result: AxiosResponse) => {
            const newLocation: SpaceLocation = result.data;
            setAvailableLocations([...availableLocations, newLocation]);
            addGroupedTagFilterOptions(0, newLocation as Trait);
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
            spaceLocation: optionToSpaceLocation(option),
        };
        setCurrentProduct(updatedProduct);
    }

    return (
        <div className="formItem">
            <label className="formItemLabel" htmlFor="location">Location</label>
            <Creatable
                name="location"
                inputId="location"
                onInputChange={(e: string): void => setTypedInLocation(e)}
                onChange={(option): void  => updateSpaceLocations(option as Option)}
                isLoading={isLoading}
                isDisabled={isLoading}
                onCreateOption={handleCreateLocationTag}
                options={locationOptions()}
                styles={customStyles}
                components={{DropdownIndicator: CustomIndicator, Option: CustomOption}}
                formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInLocation}"`)}
                placeholder="Select or create location"
                hideSelectedOptions={true}
                isClearable={false}
                value={locationOptionValue()}
            />
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormLocationField);