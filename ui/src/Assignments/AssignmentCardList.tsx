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

import React, {RefObject} from 'react';
import '../Products/Product.scss';
import {connect} from 'react-redux';
import {AvailableModals, fetchBoardsAction, setCurrentModalAction} from '../Redux/Actions';
import {
    AssignmentCardRefAndAssignmentPair,
    getProductUserDroppedAssignmentOn,
    getTopLeftOfDraggedCard,
    ProductCardRefAndProductPair,
} from '../Products/ProductDnDHelper';
import AssignmentCard from '../Assignments/AssignmentCard';
import {Product} from '../Products/Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {Assignment} from './Assignment';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AssignmentDTO} from '../Domain/AssignmentDTO';
import AssignmentClient from './AssignmentClient';

interface AssignmentCardListProps {
    container: string;
    product: Product;
    productRefs: Array<ProductCardRefAndProductPair>;
    fetchBoards(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function AssignmentCardList({
    container,
    product,
    productRefs,
    fetchBoards,
    setCurrentModal,
}: AssignmentCardListProps): JSX.Element {

    let draggingAssignmentRef: AssignmentCardRefAndAssignmentPair | undefined = undefined;
    const antiHighlightCoverRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    let assignmentCardRectHeight  = 0;

    function assignmentsSortedByPersonRoleStably(): Array<Assignment> {
        const assignments: Array<Assignment> = product.assignments;
        return assignments.sort(({person: person1}, {person: person2}) => {
            const spaceRole1 = person1.spaceRole ? person1.spaceRole.name : 'ZZZZZZZ';
            const spaceRole2 = person2.spaceRole ? person2.spaceRole.name : 'ZZZZZZZ';
            if (spaceRole1 !== spaceRole2) {
                return spaceRole1.localeCompare(spaceRole2);
            } else if (person1.name !== person2.name) {
                return person1.name.localeCompare(person2.name);
            }
            return 0;
        });
    }

    function startDraggingAssignment(ref: RefObject<HTMLDivElement>, assignment: Assignment, e: React.MouseEvent): void {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            draggingAssignmentRef = {
                ref,
                assignment,
                draggedCardOffset: getTopLeftOfDraggedCard(rect, e),
            };
            assignmentCardRectHeight = rect.bottom - rect.top;

            window.addEventListener('mousemove', makeAssignmentCardDraggable);
            window.addEventListener('mouseup', stopDraggingAssignment);
        }
    }

    function stopDraggingAssignment(): void {
        window.removeEventListener('mousemove', makeAssignmentCardDraggable);
        window.removeEventListener('mouseup', stopDraggingAssignment);

        antiHighlightCoverRef.current!.style.display = 'none';

        onDrop().then();
    }

    async function onDrop(): Promise<void> {
        if (draggingAssignmentRef && draggingAssignmentRef.ref.current) {
            const productUserDroppedAssignmentOn: ProductCardRefAndProductPair | null = getProductUserDroppedAssignmentOn(
                productRefs,
                draggingAssignmentRef.ref.current,
            );

            let assignmentUpdated = false;

            if (productUserDroppedAssignmentOn) {

                const assignment = draggingAssignmentRef.assignment;
                const newProductId = productUserDroppedAssignmentOn.product.id;
                const isDifferentProduct = assignment.productId !== newProductId;

                if (isDifferentProduct) {

                    const assignmentDTO: AssignmentDTO = {
                        id: assignment.id,
                        personId: assignment.person.id,
                        productId: newProductId,
                        placeholder: assignment.placeholder,
                    };

                    try {
                        await AssignmentClient.createAssignment(assignmentDTO);
                        await AssignmentClient.deleteAssignment(assignment);
                        fetchBoards();
                        assignmentUpdated = true;
                    } catch (error) {
                        if (error.response.status === 409) {
                            setCurrentModal({modal: AvailableModals.ASSIGNMENT_EXISTS_WARNING});
                        }
                    }
                }
            }
            if (!assignmentUpdated) {
                makeAssignmentCardNoLongerDraggable();
            }
        }
    }

    function scrollWindowIfNeeded(top: number): void {
        const height: number = window.innerHeight;
        const midpointOfRef = top + assignmentCardRectHeight;

        if (midpointOfRef >= height) {
            window.scrollBy(0, 10);
        }
        if (midpointOfRef <= 120) {
            window.scrollBy(0, -10);
        }
    }

    function makeAssignmentCardDraggable(e: MouseEvent): void {
        if (draggingAssignmentRef != null && draggingAssignmentRef.ref.current != null) {
            antiHighlightCoverRef.current!.style.display = 'block';
            const top = e.clientY - draggingAssignmentRef.draggedCardOffset.y;
            const left = e.clientX - draggingAssignmentRef.draggedCardOffset.x;
            scrollWindowIfNeeded(top);

            const ref: HTMLDivElement = draggingAssignmentRef.ref.current;
            const rect: DOMRect = ref.getBoundingClientRect();
            ref.style.width = `${rect.width}px`;
            ref.style.position = 'fixed';
            ref.style.zIndex = '11';
            ref.style.top = `${top}px`;
            ref.style.left = `${left}px`;
        } else {
            console.log('Issue with dragging assignment.');
        }
    }

    function makeAssignmentCardNoLongerDraggable(): void {
        if (draggingAssignmentRef && draggingAssignmentRef.ref.current) {
            draggingAssignmentRef.ref.current.style.display = 'flex';
            draggingAssignmentRef.ref.current.style.top = 'unset';
            draggingAssignmentRef.ref.current.style.left = 'unset';
            draggingAssignmentRef.ref.current.style.zIndex = 'unset';
            draggingAssignmentRef.ref.current.style.position = 'relative';
            draggingAssignmentRef = undefined;
        }
    }

    return (
        <React.Fragment>
            <div className="antiHighlightCover" ref={antiHighlightCoverRef}/>
            <div
                className={container === 'productDrawerContainer' ? 'unassignedPeopleContainer' : 'productPeopleContainer'}
                data-testid={container === 'productDrawerContainer' ? 'unassignedPeopleContainer' : 'productPeopleContainer'}>
                {assignmentsSortedByPersonRoleStably().map((assignment: Assignment) =>
                    <AssignmentCard assignment={assignment}
                        isUnassignedProduct={product.name === 'unassigned'}
                        startDraggingAssignment={startDraggingAssignment}
                        key={assignment.id}
                        container={container}
                    />
                )}
            </div>
        </React.Fragment>
    );
}

const mapStateToProps = ({productRefs}: GlobalStateProps) => ({
    productRefs,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchBoards: () => dispatch(fetchBoardsAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentCardList);