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

import React from 'react';
import '../Products/Product.scss';
import {connect} from 'react-redux';
import {fetchProductsAction, setCurrentModalAction, setIsDragging} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Person} from '../People/Person';
import PersonCard from "./PersonCard";

interface PersonCardListProps {
    people: Array<Person>;
    viewingDate: Date;
    setCurrentModal(modalState: CurrentModalState): void;
}

function PersonCardList({
    people,
    viewingDate,
}: PersonCardListProps): JSX.Element {

    const classNameAndDataTestId = 'archivedPeopleContainer';

    return (
        <React.Fragment>
            <div
                className={classNameAndDataTestId}
                data-testid={classNameAndDataTestId}>
                {people.map((person: Person) =>
                        <PersonCard person={person}
                            key={person.id}
                        />
                    )}
            </div>
        </React.Fragment>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    productRefs: state.productRefs,
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    setIsDragging: (isDragging: boolean) => dispatch(setIsDragging(isDragging)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonCardList);
/* eslint-enable */
