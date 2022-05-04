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

import {
    DraggedCardOffset,
    getProductWithMostOverlappingArea,
    getTopLeftOfDraggedCard,
} from './ProductDnDHelper';
import React from 'react';

describe('Dragging cards', () => {
    it('should not replace the cursor position while dragging', () => {
        const boundingBoxClientRect: DOMRect = {
            bottom: 0,
            right: 0,
            width: 50,
            height: 36,
            top: 15,
            left: 3,
        } as unknown as DOMRect;
        const mouseClickPosition: React.MouseEvent =  {
            clientX: 25,
            clientY: 20,
        } as React.MouseEvent;

        const expectedTopLeftCoords: DraggedCardOffset = {
            y: 5,
            x: 22,
        };

        const actualTopLeftCoords: DraggedCardOffset = getTopLeftOfDraggedCard(boundingBoxClientRect,  mouseClickPosition);
        expect(actualTopLeftCoords).toEqual(expectedTopLeftCoords);
    });

    describe('getting product dropped on', () => {
        const product1BoundingBox: DOMRect = {
            bottom: 15,
            right: 54,
            width: 50,
            height: 10,
            top: 5,
            left: 4,
        } as unknown as DOMRect;

        it('should drop the person card on overlapping product when only one product', () => {
            const assignmentCardBoundingBox: DOMRect = {
                bottom: 15,
                right: 30,
                width: 15,
                height: 5,
                top: 10,
                left: 15,
            } as unknown as DOMRect;

            const expectedBoundingBoxIndex = 0;
            const actualProductBoundingBoxIndex: number = getProductWithMostOverlappingArea(
                [product1BoundingBox],
                assignmentCardBoundingBox,
            );
            expect(actualProductBoundingBoxIndex).toEqual(expectedBoundingBoxIndex);
        });

        it('should return null when no overlap of assignment card and products', () => {
            const assignmentCardBoundingBox: DOMRect = {
                bottom: 105,
                right: 165,
                width: 15,
                height: 5,
                top: 100,
                left: 150,
            } as unknown as DOMRect;

            const expectedBoundingBoxIndex = -1;
            const actualProductBoundingBox: number = getProductWithMostOverlappingArea(
                [product1BoundingBox],
                assignmentCardBoundingBox,
            );
            expect(actualProductBoundingBox).toEqual(expectedBoundingBoxIndex);
        });

        it('should drop the person card on which product the person card was mostly over', () => {
            const product2BoundingBox: DOMRect = {
                bottom: 15,
                right: 109,
                width: 50,
                height: 10,
                top: 5,
                left: 59,
            } as unknown as DOMRect;

            const assignmentCardBoundingBox: DOMRect = {
                bottom: 12,
                right: 68,
                width: 15,
                height: 2,
                top: 10,
                left: 53,
            } as unknown as DOMRect;

            const expectedBoundingBoxIndex = 1;
            const actualProductBoundingBoxIndex: number = getProductWithMostOverlappingArea(
                [product1BoundingBox, product2BoundingBox],
                assignmentCardBoundingBox,
            );
            expect(actualProductBoundingBoxIndex).toEqual(expectedBoundingBoxIndex);
        });
    });

});