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

import React, {RefObject, useCallback, useRef, useState} from 'react';
import AssignmentCard from 'Assignments/AssignmentCard/AssignmentCard';
import {isUnassignedProduct} from 'Products/ProductService';
import {
    getLocalStorageFiltersByType,
    personTagsFilterKey,
    roleTagsFilterKey,
} from 'SubHeader/SortingAndFiltering/FilterLibraries';
import {isPersonMatchingSelectedFilters} from 'People/PersonService';
import useOnStorageChange from 'Hooks/useOnStorageChange/useOnStorageChange';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import {useRecoilValue} from 'recoil';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import {Product} from 'Types/Product';
import {Assignment} from 'Types/Assignment';

import 'Products/Product.scss';

interface Props {
    product: Product;
}

function AssignmentCardList({ product }: Props): JSX.Element {
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);

    const antiHighlightCoverRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

    const getFilteredAssignments = useCallback(() => {
        const roleFilters = getLocalStorageFiltersByType(roleTagsFilterKey);
        const personTagFilters = getLocalStorageFiltersByType(personTagsFilterKey);
        const _filteredAssignments = [...product.assignments]
            .sort(sortAssignmentsByPersonRole)
            .filter((assignment: Assignment) => {
                return isPersonMatchingSelectedFilters(assignment.person, roleFilters, personTagFilters);
            })

        setFilteredAssignments(_filteredAssignments);
    }, [product.assignments]);

    useOnStorageChange(getFilteredAssignments);

    function sortAssignmentsByPersonRole({person: person1}: Assignment, {person: person2}: Assignment) {
        const spaceRole1 = person1?.spaceRole?.name || '';
        const spaceRole2 = person2?.spaceRole?.name || '';
        if (spaceRole1 !== spaceRole2) return spaceRole1.localeCompare(spaceRole2);
        if (person1.name !== person2.name) return person1.name.localeCompare(person2.name);
        return 0;
    }

    const classNameAndDataTestId = isUnassignedProduct(product) ? 'unassignedPeopleContainer' : 'productPeopleContainer';

    const NoAssignmentsMessage = () => (
        <p className="no-assignments-message">
            Add a person by clicking Add Person icon above or drag them in.
        </p>
    )

    return (
        <>
            <div className="antiHighlightCover" ref={antiHighlightCoverRef}/>
            <Droppable droppableId={`product-${product.id}`} type="ASSIGNMENT_CARD">
                {(droppableProvided) => (
                    <div
                        className={classNameAndDataTestId}
                        data-testid={classNameAndDataTestId}
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                    >
                        {!isReadOnly && product.assignments.length === 0 ? (<NoAssignmentsMessage />)
                            : filteredAssignments.map((assignment: Assignment, index: number) => (
                                <Draggable
                                    key={assignment.id}
                                    draggableId={`assignment-${assignment.id}`}
                                    index={index}
                                    disableInteractiveElementBlocking
                                    isDragDisabled={false}
                                >
                                    {(draggableProvided) => (
                                        <div ref={draggableProvided.innerRef}
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            data-testid="draggableAssignmentCard"
                                        >
                                            <AssignmentCard assignment={assignment}
                                                isUnassignedProduct={isUnassignedProduct(product)}
                                                key={assignment.id}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </>
    );
}

export default AssignmentCardList;

