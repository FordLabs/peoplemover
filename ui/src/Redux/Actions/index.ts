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

import BoardClient from '../../Boards/BoardClient';
import {Board} from '../../Boards/Board';
import {Person} from '../../People/Person';
import {EditMenuToOpen} from '../../ReusableComponents/EditMenuToOpen';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import {Action, ActionCreator, Dispatch} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {AllGroupedTagFilterOptions} from '../../ReusableComponents/ProductFilter';

export enum AvailableActions {
    SET_CURRENT_MODAL,
    CLOSE_MODAL,
    SET_CURRENT_BOARD,
    SET_BOARDS,
    SET_IS_UNASSIGNED_DRAWER_OPEN,
    SET_WHICH_EDIT_MENU_OPEN,
    ADD_PERSON,
    EDIT_PERSON,
    SET_PEOPLE,
    REGISTER_PRODUCT_REF,
    UNREGISTER_PRODUCT_REF,
    SET_UNMODIFIED_INITIAL_BOARDS,
    SET_GROUPED_TAG_FILTER_OPTIONS,
}

export enum AvailableModals {
    CREATE_BOARD,
    EDIT_BOARD,
    CREATE_PRODUCT,
    EDIT_PRODUCT,
    CREATE_PERSON,
    EDIT_PERSON,
    CREATE_ASSIGNMENT,
    ASSIGNMENT_EXISTS_WARNING,
    MY_TAGS,
    MY_ROLES_MODAL,
    CREATE_SPACE,
    EDIT_CONTRIBUTORS,
}

export const setCurrentModalAction = (modalState: CurrentModalState) => ({
    type: AvailableActions.SET_CURRENT_MODAL,
    modal: modalState.modal,
    item: modalState.item,
});

export const closeModalAction = () => ({
    type: AvailableActions.CLOSE_MODAL,
});

export const setCurrentBoardAction = (board: Board, sortOptionValue: string) => ({
    type: AvailableActions.SET_CURRENT_BOARD,
    board,
    sortOptionValue,
});

export const setBoardsAction = (boards: Array<Board>) => ({
    type: AvailableActions.SET_BOARDS,
    boards,
});

export const setIsUnassignedDrawerOpenAction = (open: boolean) => ({
    type: AvailableActions.SET_IS_UNASSIGNED_DRAWER_OPEN,
    open,
});

export const setWhichEditMenuOpenAction = (menu: EditMenuToOpen) => ({
    type: AvailableActions.SET_WHICH_EDIT_MENU_OPEN,
    menu,
});

export const addPersonAction = (person: Person) => ({
    type: AvailableActions.ADD_PERSON,
    people: [person],
});

export const editPersonAction = (person: Person) => ({
    type: AvailableActions.EDIT_PERSON,
    people: [person],
});

export const setPeopleAction = (people: Array<Person>) => ({
    type: AvailableActions.SET_PEOPLE,
    people,
});

export const registerProductRefAction = (productRef: ProductCardRefAndProductPair) => ({
    type: AvailableActions.REGISTER_PRODUCT_REF,
    productRef,
});

export const unregisterProductRefAction = (productRef: ProductCardRefAndProductPair) => ({
    type: AvailableActions.UNREGISTER_PRODUCT_REF,
    productRef,
});

export const setUnmodifiedInitialBoardsAction = (boards: Array<Board>) => ({
    type: AvailableActions.SET_UNMODIFIED_INITIAL_BOARDS,
    boards,
});

export const setAllGroupedTagFilterOptions = (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => ({
    type: AvailableActions.SET_GROUPED_TAG_FILTER_OPTIONS,
    allGroupedTagFilterOptions: allGroupedTagFilterOptions,
});

export const fetchBoardsAction: ActionCreator<ThunkAction<void, Function, null, Action<string>>> = () =>
    (dispatch: Dispatch, getState: Function): Promise<void> => {
        return BoardClient.getAllBoards().then(result => {
            const boards: Array<Board> = result.data || [];
            const boardsWithoutTransitionPrefix = boards.filter(board => !board.name.startsWith(BOARD_PREFIX_TO_HIDE_DURING_TRANSITION));

            dispatch(setBoardsAction(boardsWithoutTransitionPrefix));

            const board: Board = getBoardFromBoardsById(
                getState().currentBoard ? getState().currentBoard.id : null,
                boardsWithoutTransitionPrefix
            );
            if (getState().currentBoard !== board) {
                const sort = localStorage.getItem('sortBy') ?? 'name';
                dispatch(setCurrentBoardAction(board, sort));
            }
        });
    };

export const BOARD_PREFIX_TO_HIDE_DURING_TRANSITION = '#NOPE$';

function getBoardFromBoardsById(boardId: number, boards: Array<Board>): Board {
    if (boards.length === 0 ) {
        return {} as Board;
    }

    let board: Board;
    if (boardId == null) {
        board = boards[0];
    } else {
        board = boards.find(board => board!.id === boardId) || boards[0];
    }
    return board;
}