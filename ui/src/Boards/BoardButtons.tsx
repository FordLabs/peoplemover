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

import React from 'react';
import {setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import './BoardButtons.scss';
import ProductFilter from '../ReusableComponents/ProductFilter';
import ProductSortBy from '../ReusableComponents/ProductSortBy';
import {Dispatch} from 'redux';
import AccountDropdown from '../ReusableComponents/AccountDropdown';

interface BoardButtonsProps {
    setCurrentModal(modalState: CurrentModalState): void;
    hideSpaceButtons?: boolean;
}

function BoardButtons({hideSpaceButtons}: BoardButtonsProps): JSX.Element {

    return (
        <div className="boardButtons">
            {!hideSpaceButtons &&
                <>
                    <div className={'filterByDropDownContainer'} data-testid={'filterByDropDownContainer'}>
                        <ProductFilter/>
                    </div>

                    < div className={'sortByDropDownContainer'}>
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

export default connect(null, mapDispatchToProps)(BoardButtons);
