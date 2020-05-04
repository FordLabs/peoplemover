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
import './BoardSelectionTabs.scss';
import {AvailableModals, setCurrentBoardAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {Board} from './Board';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Dispatch} from 'redux';

interface BoardSelectionTabsProps {
    currentBoard: Board;
    boards: Array<Board>;

    changeCurrentBoard(board: Board, sortOptionValue: string): void;

    setCurrentModal(modalState: CurrentModalState): void;
}

function BoardSelectionTabs({
    currentBoard,
    boards,
    changeCurrentBoard,
    setCurrentModal,
}: BoardSelectionTabsProps): JSX.Element {

    function tabSelectedStyles(currentBoard: Board, boardId: number): string {
        if (currentBoard && currentBoard.id === boardId) {
            return 'selected';
        }
        return '';
    }

    return (
        <div className="boardSelectionContainer">
            {boards.length > 0 && (
                <div className="tabContainer">
                    {boards.map((board: Board, index: number) => {
                        const baseClassName = tabSelectedStyles(currentBoard, board.id);
                        return (
                            <React.Fragment key={index}>
                                <div className={`${baseClassName} tab`}
                                    onClick={() => changeCurrentBoard(board, localStorage.getItem('sortBy')!)}
                                    key={board.id}>

                                    <button
                                        className={baseClassName}
                                        key={board.id}
                                    >
                                        {board.name}
                                    </button>

                                    <div
                                        className={`${baseClassName} fas fa-ellipsis-v icon`}
                                        onClick={() => setCurrentModal({modal: AvailableModals.EDIT_BOARD, item: board})}
                                        data-testid={'openEditBoardIcon-' + board.id}/>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            )}
            <div className="spaceFiller"/>
            <button className="selectionTabButton tab"
                onClick={() => setCurrentModal({modal: AvailableModals.MY_TAGS})}
                data-testid="myTagsButton">
                <div className="fas fa-tags myTagsIcon" data-testid="myTagsIcon"/>
                My Tags
            </button>
            <button className="selectionTabButton tab"
                onClick={() => setCurrentModal({modal: AvailableModals.MY_ROLES_MODAL})}>
                <div className="fas fa-id-badge myRolesIcon" data-testid="myRolesIcon"/>
                My Roles
            </button>
            <button className="selectionTabButton tab"
                onClick={() => setCurrentModal({modal: AvailableModals.CREATE_BOARD})}
                data-testid="createBoardButton">
                <div className="fa fa-plus addBoardIcon"/>
                New Board
            </button>
        </div>
    );
}

const mapStateToProps = ({currentBoard, boards}: GlobalStateProps ) => ({
    currentBoard,
    boards,
});



const mapDispatchToProps = (dispatch: Dispatch) => ({
    changeCurrentBoard: (board: Board, sortOptionValue: string) => dispatch(setCurrentBoardAction(board, sortOptionValue)),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BoardSelectionTabs);