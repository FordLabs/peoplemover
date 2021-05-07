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

import React, {RefObject} from 'react';
import '../Products/Product.scss';
import {connect} from 'react-redux';
import {fetchProductsAction, setCurrentModalAction, setIsDragging} from '../Redux/Actions';
import {
    AssignmentCardRefAndAssignmentPair,
    getProductUserDroppedAssignmentOn,
    getTopLeftOfDraggedCard,
    ProductCardRefAndProductPair,
} from '../Products/ProductDnDHelper';
import AssignmentCard from '../Assignments/AssignmentCard';
import {isUnassignedProduct, Product} from '../Products/Product';
import {GlobalStateProps} from '../Redux/Reducers';
import {Assignment} from './Assignment';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import AssignmentClient from './AssignmentClient';
import {ProductPlaceholderPair} from './CreateAssignmentRequest';
import moment from 'moment';
import {getSelectedFilterLabels} from '../Redux/Reducers/allGroupedTagOptionsReducer';
import {Space} from '../Space/Space';
import {AllGroupedTagFilterOptions, FilterTypeListings} from '../SortingAndFiltering/FilterLibraries';
import {AvailableModals} from '../Modal/AvailableModals';
import {isPersonMatchingSelectedFilters} from '../People/Person';

interface AssignmentCardListProps {
    product: Product;
    productRefs: Array<ProductCardRefAndProductPair>;
    currentSpace: Space;
    viewingDate: Date;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    fetchProducts(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    setIsDragging(isDragging: boolean): void;
}

function AssignmentCardList({
    product,
    productRefs,
    currentSpace,
    viewingDate,
    allGroupedTagFilterOptions,
    fetchProducts,
    setCurrentModal,
    setIsDragging,
}: AssignmentCardListProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;
    let draggingAssignmentRef: AssignmentCardRefAndAssignmentPair | undefined = undefined;
    const antiHighlightCoverRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    let assignmentCardRectHeight  = 0;
    const getSelectedRoleFilters = (): Array<string> => getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.Role.index].options);
    const getSelectedPersonTagFilters = (): Array<string> => getSelectedFilterLabels(allGroupedTagFilterOptions[FilterTypeListings.PersonTag.index].options);

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

    function filterAssignmentByRoleAndProductTag(assignment: Assignment): boolean {
        return isPersonMatchingSelectedFilters(assignment.person, getSelectedRoleFilters(), getSelectedPersonTagFilters());
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

    function setAntiHighlightCoverDisplay(display: string): void {
        if (antiHighlightCoverRef.current) {
            antiHighlightCoverRef.current.style.display = display;
        }
    }

    function stopDraggingAssignment(): void {
        window.removeEventListener('mousemove', makeAssignmentCardDraggable);
        window.removeEventListener('mouseup', stopDraggingAssignment);

        setAntiHighlightCoverDisplay('none');
        setIsDragging(false);

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

                const oldAssignment = draggingAssignmentRef.assignment;
                const newProductId = productUserDroppedAssignmentOn.product.id;
                const isDifferentProduct = oldAssignment.productId !== newProductId;

                if (isDifferentProduct) {
                    const existingAssignments: Array<Assignment> = (await AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, oldAssignment.person.id, viewingDate)).data;
                    const productPlaceholderPairs: Array<ProductPlaceholderPair> = existingAssignments
                        .map(existingAssignment => {
                            return ({
                                productId: existingAssignment.productId,
                                placeholder: existingAssignment.placeholder,
                            });
                        })
                        .filter(existingAssignment => existingAssignment.productId !== oldAssignment.productId)
                        .concat({
                            productId: newProductId,
                            placeholder: oldAssignment.placeholder,
                        });

                    try {
                        await AssignmentClient.createAssignmentForDate(
                            moment(viewingDate).format('YYYY-MM-DD'),
                            productPlaceholderPairs,
                            currentSpace,
                            oldAssignment.person
                        );
                        fetchProducts();
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
            setAntiHighlightCoverDisplay('block');
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

            setIsDragging(true);
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

    const classNameAndDataTestId = isUnassignedProduct(product) ? 'unassignedPeopleContainer' : 'productPeopleContainer';

    return (
        <React.Fragment>
            <div className="antiHighlightCover" ref={antiHighlightCoverRef}/>
            <div
                className={classNameAndDataTestId}
                data-testid={classNameAndDataTestId}>
                {assignmentsSortedByPersonRoleStably()
                    .filter(filterAssignmentByRoleAndProductTag)
                    .map((assignment: Assignment) =>
                        <AssignmentCard assignment={assignment}
                            isUnassignedProduct={isUnassignedProduct(product)}
                            startDraggingAssignment={startDraggingAssignment}
                            key={assignment.id}
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

export default connect(mapStateToProps, mapDispatchToProps)(AssignmentCardList);
/* eslint-enable */
