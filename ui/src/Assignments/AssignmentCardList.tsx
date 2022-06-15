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
import AssignmentCard from 'Assignments/AssignmentCard';
import {isUnassignedProduct, Product} from 'Products/Product';
import {Assignment} from './Assignment';
import {
    getLocalStorageFiltersByType,
    personTagsFilterKey,
    roleTagsFilterKey,
} from '../SortingAndFiltering/FilterLibraries';
import {isPersonMatchingSelectedFilters} from 'People/Person';
import useOnStorageChange from '../Hooks/useOnStorageChange/useOnStorageChange';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import {useRecoilValue} from 'recoil';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

import '../Products/Product.scss';

interface Props {
    product: Product;
}

function AssignmentCardList({product }: Props): JSX.Element {
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

    // function startDraggingAssignment(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void {
    //     if (ref.current) {
    //         const rect = ref.current.getBoundingClientRect();
    //         draggingAssignmentRef = {
    //             ref,
    //             assignment,
    //             draggedCardOffset: getTopLeftOfDraggedCard(rect, e),
    //         };
    //         assignmentCardRectHeight = rect.bottom - rect.top;
    //
    //         window.addEventListener('mousemove', makeAssignmentCardDraggable);
    //         window.addEventListener('mouseup', stopDraggingAssignment);
    //     }
    // }

    // function setAntiHighlightCoverDisplay(display: string): void {
    //     if (antiHighlightCoverRef.current) {
    //         antiHighlightCoverRef.current.style.display = display;
    //     }
    // }

    // function stopDraggingAssignment(): void {
    //     window.removeEventListener('mousemove', makeAssignmentCardDraggable);
    //     window.removeEventListener('mouseup', stopDraggingAssignment);
    //
    //     setAntiHighlightCoverDisplay('none');
    //     setIsDragging(false);
    //
    //     onDrop().then();
    // }

    // async function onDrop(): Promise<void> {
    //     if (draggingAssignmentRef && draggingAssignmentRef.ref.current) {
    //         const productUserDroppedAssignmentOn: ProductCardRefAndProductPair | null = getProductUserDroppedAssignmentOn(
    //             productRefs,
    //             draggingAssignmentRef.ref.current,
    //         );
    //
    //         let assignmentUpdated = false;
    //
    //         if (productUserDroppedAssignmentOn) {
    //
    //             const oldAssignment = draggingAssignmentRef.assignment;
    //             const newProductId = productUserDroppedAssignmentOn.product.id;
    //             const isDifferentProduct = oldAssignment.productId !== newProductId;
    //
    //             if (isDifferentProduct) {
    //                 const existingAssignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, oldAssignment.person.id, viewingDate)).data;
    //                 const productPlaceholderPairs: Array<ProductPlaceholderPair> = existingAssignments
    //                     .map(existingAssignment => {
    //                         return ({
    //                             productId: existingAssignment.productId,
    //                             placeholder: existingAssignment.placeholder,
    //                         });
    //                     })
    //                     .filter(existingAssignment => existingAssignment.productId !== oldAssignment.productId)
    //                     .concat({
    //                         productId: newProductId,
    //                         placeholder: oldAssignment.placeholder,
    //                     });
    //
    //                 try {
    //                     await AssignmentClient.createAssignmentForDate(
    //                         moment(viewingDate).format('YYYY-MM-DD'),
    //                         productPlaceholderPairs,
    //                         currentSpace,
    //                         oldAssignment.person
    //                     );
    //                     fetchProducts(viewingDate);
    //                     assignmentUpdated = true;
    //                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //                 } catch (error: any) {
    //                     if (error.response.status === 409) {
    //                         setCurrentModal({modal: AvailableModals.ASSIGNMENT_EXISTS_WARNING});
    //                     }
    //                 }
    //             }
    //         }
    //         if (!assignmentUpdated) {
    //             makeAssignmentCardNoLongerDraggable();
    //         }
    //     }
    // }

    // function scrollWindowIfNeeded(top: number): void {
    //     const height: number = window.innerHeight;
    //     const midpointOfRef = top + assignmentCardRectHeight;
    //
    //     if (midpointOfRef >= height) {
    //         window.scrollBy(0, 10);
    //     }
    //     if (midpointOfRef <= 120) {
    //         window.scrollBy(0, -10);
    //     }
    // }

    // function makeAssignmentCardDraggable(e: MouseEvent): void {
    //     if (draggingAssignmentRef != null && draggingAssignmentRef.ref.current != null) {
    //         setAntiHighlightCoverDisplay('block');
    //         const top = e.clientY - draggingAssignmentRef.draggedCardOffset.y;
    //         const left = e.clientX - draggingAssignmentRef.draggedCardOffset.x;
    //         scrollWindowIfNeeded(top);
    //
    //         const ref: HTMLDivElement = draggingAssignmentRef.ref.current;
    //         const rect: DOMRect = ref.getBoundingClientRect();
    //         ref.style.width = `${rect.width}px`;
    //         ref.style.position = 'fixed';
    //         ref.style.zIndex = '11';
    //         ref.style.top = `${top}px`;
    //         ref.style.left = `${left}px`;
    //
    //         setIsDragging(true);
    //     } else {
    //         console.log('Issue with dragging assignment.');
    //     }
    // }

    // function makeAssignmentCardNoLongerDraggable(): void {
    //     if (draggingAssignmentRef && draggingAssignmentRef.ref.current) {
    //         draggingAssignmentRef.ref.current.style.display = 'flex';
    //         draggingAssignmentRef.ref.current.style.top = 'unset';
    //         draggingAssignmentRef.ref.current.style.left = 'unset';
    //         draggingAssignmentRef.ref.current.style.zIndex = 'unset';
    //         draggingAssignmentRef.ref.current.style.position = 'relative';
    //         draggingAssignmentRef = undefined;
    //     }
    // }

    const classNameAndDataTestId = isUnassignedProduct(product) ? 'unassignedPeopleContainer' : 'productPeopleContainer';

    return (
        <>
            <div className="antiHighlightCover" ref={antiHighlightCoverRef}/>
            <Droppable droppableId={`product-${product.id}`} type="ASSIGNMENT_CARD">
                {(provided) => (
                    <div
                        className={classNameAndDataTestId}
                        data-testid={classNameAndDataTestId}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {!isReadOnly && product.assignments.length === 0 ? (
                            <div className="emptyProductText">
                                <div className="emptyProductTextHint">
                                    <p>Add a person by clicking Add Person icon above or drag them in.</p>
                                </div>
                            </div>
                        ) : filteredAssignments.map((assignment: Assignment, index: number) => (
                            <Draggable
                                key={assignment.id}
                                draggableId={`assignment-${assignment.id}`}
                                index={index}
                                disableInteractiveElementBlocking
                                isDragDisabled={false}
                            >
                                {(provided) => (
                                    <div ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}>
                                        <AssignmentCard assignment={assignment}
                                            isUnassignedProduct={isUnassignedProduct(product)}
                                            // startDraggingAssignment={startDraggingAssignment}
                                            key={assignment.id}
                                        />
                                    </div>

                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </>
    );
}

export default AssignmentCardList;

