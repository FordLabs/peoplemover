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

import React, {createRef, useEffect, useState} from 'react';
import {GlobalStateProps, SortByType} from '../Redux/Reducers';
import {connect} from 'react-redux';
import './NewProductFilterOrSortBy.scss';
import {setProductSortByAction} from '../Redux/Actions';
import {Space} from '../Space/Space';
import MatomoEvents from '../Matomo/MatomoEvents';
import AccessibleDropdownContainer from './AccessibleDropdownContainer';

interface SortByOption {
    label: string;
    value: SortByType;
}

interface ProductSortByProps {
    productSortBy: SortByType;
    currentSpace: Space;
    setProductSortBy(productSortBy: SortByType): void;
}

function ProductSortBy({
    productSortBy,
    currentSpace,
    setProductSortBy,
}: ProductSortByProps): JSX.Element {
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);
    const [selectedSortOption, setSelectedSortOption] = useState<SortByOption>();
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

        setSelectedSortOption(stringToOption(productSortBy));
    }, [productSortBy]);
    /* eslint-enable */

    const toggleDropdownMenu = (): void => {
        setDropdownToggle(!dropdownToggle);
    };

    return (
        <div className="newSortByDropdownContainer" data-testid="sortByContainer">
            <i className="material-icons sortby-icon" aria-hidden >sort</i>
            <label id="sortby-dropdown-label" htmlFor="sortby-dropdown" className="dropdown-label">Sort By:</label>
            <button id="sortby-dropdown-button" className="sortby-dropdown-selected-option"
                onClick={(): void => { toggleDropdownMenu();}}
                onKeyUp={(event): void => { if (event.key === 'ArrowDown' && !dropdownToggle) { toggleDropdownMenu();} }}
                data-testid="sortByDropdownButton">
                {selectedSortOption?.label}
                {dropdownToggle
                    ? <i id="sortby-dropdown-button-arrow-up" className="material-icons greyIcon">keyboard_arrow_up</i>
                    : <i className="material-icons greyIcon">keyboard_arrow_down</i>
                }
            </button>
            {dropdownToggle &&
                <AccessibleDropdownContainer
                    className="sortDropdown"
                    handleClose={(): void => {
                        setDropdownToggle(false);
                    }}
                    testId="sortByDropdownMenu"
                    dontCloseForTheseIds={['sortby-dropdown-button', 'sortby-dropdown-button-arrow-up']}>
                    {sortByOptions.map((option, index) => {
                        return <button
                            key={option.value}
                            id={`sortDropdownOption_${option.value}`}
                            className="sortDropdownOption"
                            data-testid={`sortDropdownOption_${option.value}`}
                            ref={createRef<HTMLButtonElement>()}
                            onClick={ (): void => {
                                setProductSortBy(option.value);
                                MatomoEvents.pushEvent(currentSpace.name, 'sort', option.label);
                                setDropdownToggle(false);
                            }}>
                            {option.label}
                            {option.value === selectedSortOption?.value && <i className="material-icons sortby-option-check">check</i>}
                        </button>;
                    })}
                </AccessibleDropdownContainer>
            }
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
