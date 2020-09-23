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

import React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import ProductFilter from '../ReusableComponents/ProductFilter';
import ProductSortBy from '../ReusableComponents/ProductSortBy';
import AccountDropdown from '../ReusableComponents/AccountDropdown';

import './SpaceButtons.scss';

interface SpaceButtonsProps {
    setCurrentModal(modalState: CurrentModalState): void;
    hideSpaceButtons?: boolean;
}

function SpaceButtons({hideSpaceButtons}: SpaceButtonsProps): JSX.Element {
    return (
        <div className="spaceButtons">
            {!hideSpaceButtons &&
                <>
                    <div className="filterByDropDownContainer" data-testid="filterByDropDownContainer">
                        <ProductFilter/>
                    </div>
                    <div className="sortByDropDownContainer">
                        <ProductSortBy/>
                    </div>
                </>
            }
            <AccountDropdown hideSpaceButtons={hideSpaceButtons}/>
        </div>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceButtons);
