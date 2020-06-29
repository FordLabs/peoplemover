/*
 * Copyright (c) 2019 Ford Motor Company
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

import Select from 'react-select';
import {CustomIndicator, filterByStyles, SortByOption} from './ReactSelectStyles';
import React, {useEffect, useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Option} from '../CommonTypes/Option';
import './ProductFilterOrSortBy.scss';
import {setProductsAction} from '../Redux/Actions';
import {Product} from '../Products/Product';

interface ProductSortByProps {
    sortValueOption: string;
    products: Product[];
    setProducts(products: Product[], sortOption: string): void;
}

function ProductSortBy({
    sortValueOption,
    products,
    setProducts,
}: ProductSortByProps): JSX.Element {

    const [originalSortOption, setOriginalSortOption] = useState<Option>();
    const sortByOptions: Array<Option> = [
        {label:'Name', value:'name'},
        {label:'Location', value:'location'},
    ];
    useEffect( () => {
        setOriginalSortOption(stringToOption(sortValueOption));
    }, [sortValueOption]);

    function stringToOption(value: string): Option {
        return sortByOptions.filter(option => option.value === value)[0];
    }
    return (
        <React.Fragment>
            <label htmlFor="sortby-dropdown" className={'dropdown-label'}>Sort By:</label>
            <Select
                styles={filterByStyles}
                data-testid={'sortby-dropdown'}
                className={'dropdown sortby-dropdown'}
                inputId="sortby-dropdown"
                options={sortByOptions}
                value={originalSortOption}
                onChange={(value): void => setProducts(products, (value as Option).value)}
                components={{Option: SortByOption, DropdownIndicator: CustomIndicator}}/>
        </React.Fragment>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    sortValueOption: state.sortValueOption,
    products: state.products,
});

const mapDispatchToProps = (dispatch: any) => ({
    setProducts: (products: Array<Product>, sortOption: string) => dispatch(setProductsAction(products, sortOption)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductSortBy);
