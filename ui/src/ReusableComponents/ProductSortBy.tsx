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
import {GlobalStateProps, SortByType} from '../Redux/Reducers';
import {connect} from 'react-redux';
import './ProductFilterOrSortBy.scss';
import {setProductSortByAction} from '../Redux/Actions';

interface SortByOption {
    label: string;
    value: SortByType;
}

interface ProductSortByProps {
    productSortBy: SortByType;
    setProductSortBy(productSortBy: SortByType): void;
}

function ProductSortBy({
    productSortBy,
    setProductSortBy,
}: ProductSortByProps): JSX.Element {
    const [originalSortOption, setOriginalSortOption] = useState<SortByOption>();
    const sortByOptions: Array<SortByOption> = [
        {label:'Alphabetical', value:'name'},
        {label:'Location', value:'location'},
        {label:'Product Tag', value:'product-tag'},
    ];
    useEffect( () => {
        setOriginalSortOption(stringToOption(productSortBy));
    }, [productSortBy]);

    function stringToOption(value: string): SortByOption {
        return sortByOptions.filter(option => option.value === value)[0];
    }
    return (
        <React.Fragment>
            <label htmlFor="sortby-dropdown" className="dropdown-label">Sort By:</label>
            <Select
                styles={filterByStyles}
                id="sortby-dropdown"
                className="dropdown sortby-dropdown"
                classNamePrefix="product-sort-by"
                inputId="sortby-dropdown"
                options={sortByOptions}
                value={originalSortOption}
                onChange={(value): void => setProductSortBy((value as SortByOption).value)}
                components={{Option: SortByOption, DropdownIndicator: CustomIndicator}}/>
        </React.Fragment>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    productSortBy: state.productSortBy,
});

const mapDispatchToProps = (dispatch: any) => ({
    setProductSortBy: (productSortBy: SortByType) => dispatch(setProductSortByAction(productSortBy)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductSortBy);
