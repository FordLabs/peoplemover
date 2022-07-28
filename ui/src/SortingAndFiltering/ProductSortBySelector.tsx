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

import React, {createRef, useCallback, useEffect, useState} from 'react';
import Dropdown from '../ReusableComponents/Dropdown';
import NavigationSection from '../ReusableComponents/NavigationSection';
import {useRecoilState} from 'recoil';
import {ProductSortBy, ProductSortByState} from '../State/ProductSortByState';

import './FilterOrSortBy.scss';

interface SortByOption {
    label: string;
    value: ProductSortBy;
}

const sortByOptions: SortByOption[] = [
    {label:'Alphabetical', value: ProductSortBy.NAME},
    {label:'Location', value: ProductSortBy.LOCATION},
    {label:'Product Tag', value: ProductSortBy.PRODUCT_TAG},
];

function ProductSortBySelector(): JSX.Element {
    const [productSortBy, setProductSortBy] = useRecoilState(ProductSortByState);

    const [selectedSortOption, setSelectedSortOption] = useState<SortByOption>();

    const stringToOption = useCallback((value: string): SortByOption => {
        return sortByOptions.filter(option => option.value === value)[0];
    }, []);

    useEffect( () => {
        setSelectedSortOption(stringToOption(productSortBy));
    }, [productSortBy, stringToOption]);

    const dropdownContent = (
        <>{sortByOptions.map((option) => (
            <button
                key={option.value}
                id={`sortDropdownOption_${option.value}`}
                className="sortDropdownOption"
                data-testid={`sortDropdownOption_${option.value}`}
                ref={createRef<HTMLButtonElement>()}
                onClick={(): void => setProductSortBy(option.value)}>
                {option.label}
                {option.value === selectedSortOption?.value && <i className="material-icons sortby-option-check">check</i>}
            </button>
        ))}</>
    );

    return (
        <NavigationSection label="Sort By" icon="sort">
            <Dropdown
                buttonId="sortby-dropdown-button"
                dropdownButtonContent={selectedSortOption?.label}
                dropdownContent={dropdownContent}
                dropdownOptionIds={['sortby-dropdown-button']}
                buttonTestId="sortByDropdownButton"
                dropdownTestId="sortByDropdownMenu"
                closeOnSelect
            />
        </NavigationSection>
    );
}

export default ProductSortBySelector;
