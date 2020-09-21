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

import React, {RefObject} from 'react';
import {Product} from './Product';
import {Assignment} from '../Assignments/Assignment';

export interface DraggedCardOffset {
    y: number;
    x: number;
}

export interface ProductCardRefAndProductPair {
    ref: RefObject<HTMLDivElement>;
    product: Product;
}

export interface AssignmentCardRefAndAssignmentPair {
    ref: RefObject<HTMLDivElement>;
    assignment: Assignment;
    draggedCardOffset: DraggedCardOffset;
}

export const getProductUserDroppedAssignmentOn = (
    productRefs: Array<ProductCardRefAndProductPair>,
    droppedAssignmentRef: HTMLDivElement,
): ProductCardRefAndProductPair | null => {
    const listOfClientRectsForAllProducts = getListOfClientRectsForAllProducts(productRefs);

    const droppedAssignmentBoundingBox: ClientRect = droppedAssignmentRef.getBoundingClientRect();
    hideDroppedAssignment(droppedAssignmentRef);

    const droppedIntoProductIndex: number = getProductWithMostOverlappingArea(
        listOfClientRectsForAllProducts,
        droppedAssignmentBoundingBox
    );

    return productRefs[droppedIntoProductIndex];
};

export const getTopLeftOfDraggedCard = (
    boundingBoxClientRect: ClientRect,
    mouseClickPosition: React.MouseEvent
): DraggedCardOffset => {
    return {
        y: mouseClickPosition.clientY - boundingBoxClientRect.top,
        x: mouseClickPosition.clientX - boundingBoxClientRect.left,
    };
};

const isOverlapping = (productRect: ClientRect, assignmentRect: ClientRect): boolean => {
    if (productRect && assignmentRect) {
        const isOverlapping = productRect.right >= assignmentRect.left &&
            productRect.left <= assignmentRect.right &&
            productRect.bottom >= assignmentRect.top &&
            productRect.top <= assignmentRect.bottom;
        return isOverlapping;
    } else {
        return false;
    }
};

export const getProductWithMostOverlappingArea = (
    productRects: Array<ClientRect>,
    assignmentCardBoundingBox: ClientRect,
): number => {
    let maxIntersectedAreaRectIndex = -1;
    let tempArea = 0;

    productRects.forEach((overlappingProduct: ClientRect, index: number) => {
        if (!isOverlapping(overlappingProduct, assignmentCardBoundingBox)) {
            return;
        }
        const currentProductIntersectedArea =
            (
                Math.min(overlappingProduct.right, assignmentCardBoundingBox.right) -
                Math.max(overlappingProduct.left, assignmentCardBoundingBox.left)
            ) *
            (
                Math.min(overlappingProduct.bottom, assignmentCardBoundingBox.bottom) -
                Math.max(overlappingProduct.top, assignmentCardBoundingBox.top)
            );
        if (tempArea < currentProductIntersectedArea) {
            tempArea = currentProductIntersectedArea;
            maxIntersectedAreaRectIndex = index;
        }
    });

    return maxIntersectedAreaRectIndex;
};

const getListOfClientRectsForAllProducts = (productRefs: Array<ProductCardRefAndProductPair>): Array<ClientRect> => {
    return productRefs.reduce((accumulator: Array<ClientRect>, productRef: ProductCardRefAndProductPair) => {
        accumulator.push(productRef.ref.current!.getBoundingClientRect());
        return accumulator;
    }, []);
};

const hideDroppedAssignment = (droppedAssignmentRef: HTMLDivElement): void => {
    droppedAssignmentRef.style.position = 'static';
    droppedAssignmentRef.style.width = 'auto';
    droppedAssignmentRef.style.display = 'none';
};
