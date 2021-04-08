/*
 * Copyright (c) 2021 Ford Motor Company
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

import Select, {OptionProps, OptionTypeBase, Props} from 'react-select';
import {
    CustomIndicator,
    isUserTabbingAndFocusedOnElement,
    reactSelectStyles,
} from '../ModalFormComponents/ReactSelectStyles';
import React, {CSSProperties, useEffect, useState} from 'react';
import {GlobalStateProps, SortByType} from '../Redux/Reducers';
import {connect} from 'react-redux';
import './ProductFilterOrSortBy.scss';
import {setProductSortByAction} from '../Redux/Actions';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';

interface SortByOption {
    label: string;
    value: SortByType;
}

interface ProductSortByProps {
    productSortBy: SortByType;
    currentSpace: Space;
    setProductSortBy(productSortBy: SortByType): void;
}

const SortByOption = (props: OptionProps<OptionTypeBase>): JSX.Element => {
    const {label, innerProps, isSelected} = props;
    return (
        <div className="sortby-option" {...innerProps}>
            <span className="sortby-label-name">{label}</span>
            {isSelected && <i className="material-icons sortby-option-check">check</i>}
        </div>
    );
};

const sortByStyle = {
    ...reactSelectStyles,
    control: (provided: CSSProperties, props: Props): CSSProperties => ({
        ...provided,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        boxShadow: isUserTabbingAndFocusedOnElement(props) ? '0 0 0 2px #4C8EF5' : 'none',
        // @ts-ignore
        '&:hover': {
            boxShadow: 'none !important',
            borderColor: '#EDEBEB',
            cursor: 'pointer',
        },
        flexWrap: 'unset',
    }),
    singleValue: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        backgroundColor: '#F2E7F3',
        borderRadius: '6px',
        padding: '6px',
        color: '#403D3D',
        float: 'right',
    }),
    menu: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        maxWidth: '150px',
        minWidth: '150px',
        right: '0',
        padding: '16px 15px',
        margin: '0',
    }),
    option: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        fontFamily: 'Helvetica, sans-serif',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0px 10px',
        height: '30px',
        margin: '3px 0px',
        cursor: 'pointer',
    }),
    dropdownIndicator: (provided: CSSProperties): CSSProperties => ({
        ...provided,
        padding: '0px',
    }),
};

function ProductSortBy({
    productSortBy,
    currentSpace,
    setProductSortBy,
}: ProductSortByProps): JSX.Element {
    const [originalSortOption, setOriginalSortOption] = useState<SortByOption>();
    const sortByOptions: Array<SortByOption> = [
        {label:'Alphabetical', value:'name'},
        {label:'Location', value:'location'},
        {label:'Product Tag', value:'product-tag'},
    ];

    /* eslint-disable */
    useEffect( () => {
        function stringToOption(value: string): SortByOption {
            return sortByOptions.filter(option => option.value === value)[0];
        }

        setOriginalSortOption(stringToOption(productSortBy));
    }, [productSortBy]);
    /* eslint-enable */

    return (
        <div className="sortByDropdownContainer" data-testid="sortBy">
            <label id="sortby-dropdown-label" htmlFor="sortby-dropdown" className="dropdown-label">Sort By:</label>
            <Select
                styles={sortByStyle}
                id="sortby-dropdown"
                className="dropdown old-sortby-dropdown"
                classNamePrefix="product-sort-by"
                inputId="sortby-dropdown-input"
                aria-labelledby="sortby-dropdown-label"
                options={sortByOptions}
                value={originalSortOption}
                onChange={(value): void => {
                    const sortByOption = (value as SortByOption).value;
                    setProductSortBy(sortByOption);
                    MatomoEvents.pushEvent(currentSpace.name, 'sort', sortByOption);
                }}
                components={{Option: SortByOption, DropdownIndicator: CustomIndicator}}/>
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    productSortBy: state.productSortBy,
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    setProductSortBy: (productSortBy: SortByType) => dispatch(setProductSortByAction(productSortBy)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProductSortBy);
/* eslint-enable */
