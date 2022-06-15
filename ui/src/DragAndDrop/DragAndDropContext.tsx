/*
 * Copyright (c) 2022. Ford Motor Company
 *  All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, {PropsWithChildren, useCallback} from 'react';
import {DragDropContext, OnDragEndResponder} from 'react-beautiful-dnd';

type Props = {};

function DragAndDrop({ children }: PropsWithChildren<Props>): JSX.Element {

    const onDragEnd: OnDragEndResponder = useCallback(
        (result) => {
            console.log('result', result)

            if (!result.destination) return;

            const assignmentId = parseInt(result.draggableId);
            const productId = parseInt(result.destination!.droppableId);
            console.log('productId', productId)

            let oldColumnId: number;
            // const newColumn = columns.find((c) => c.id === columnId);
            //
            // if (!newColumn) return;
            //
            // setThoughts((currentState: Thought[]) => {
            //     return currentState.map((thought) => {
            //         if (thought.id === thoughtId) {
            //             oldColumnId = thought.columnId;
            //             return { ...thought, columnId: newColumn.id };
            //         }
            //         return thought;
            //     });
            // });
            // ThoughtService.updateColumn(team.id, thoughtId, columnId).catch(() => {
            //     if (!oldColumnId) return;
            //
            //     setThoughts((currentState: Thought[]) => {
            //         return currentState.map((thought) =>
            //             thought.id === thoughtId
            //                 ? { ...thought, columnId: oldColumnId }
            //                 : thought
            //         );
            //     });
            // });
        },
        []
    );

    return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>;
}

export default DragAndDrop;