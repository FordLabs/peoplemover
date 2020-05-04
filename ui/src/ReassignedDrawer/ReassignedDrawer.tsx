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

import React, {useEffect, useState} from 'react';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import './ReassignedDrawer.scss';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Board} from '../Boards/Board';
import {BoardComparison} from '../ReusableComponents/BoardComparison';
import {setUnmodifiedInitialBoardsAction} from '../Redux/Actions';
import {Dispatch} from 'redux';
import {Reassignment} from './Reassignment';

interface ReassignedDrawerProps {
    currentBoard: Board;
    unmodifiedInitialBoards: Array<Board>;
    boards: Array<Board>;

    setUnmodifiedInitialBoards: (board: Array<Board>) => void;
}

function ReassignedDrawer({
    currentBoard,
    unmodifiedInitialBoards,
    boards,
    setUnmodifiedInitialBoards,
}: ReassignedDrawerProps): JSX.Element {
    const [showDrawer, setShowDrawer] = useState(true);
    const [reassignments, setReassignments] = useState<Array<Reassignment>>([]);
    const [currentUnmodifiedBoard, setCurrentUnmodifiedBoard] = useState<Board>();

    useEffect(() => {
        if (boards && unmodifiedInitialBoards.length === 0) {
            setUnmodifiedInitialBoards(boards);
        }
    }, [boards]);

    useEffect(() => {
        if (currentBoard) {
            setUpCurrentUnmodifiedBoard();
        }
        compareBoards();
    }, [currentBoard]);

    useEffect(() => {
        compareBoards();
    }, [unmodifiedInitialBoards, currentUnmodifiedBoard]);

    function setUpCurrentUnmodifiedBoard(): void {
        const unmodifiedInitialBoard: Board | undefined = unmodifiedInitialBoards.find(board => board.id === currentBoard.id);

        const boardWasChanged = unmodifiedInitialBoard && currentUnmodifiedBoard && currentUnmodifiedBoard.id !== unmodifiedInitialBoard.id;
        const haveNotCreatedCurrentUnmodifiedBoard = unmodifiedInitialBoard && !currentUnmodifiedBoard;

        if (boardWasChanged || haveNotCreatedCurrentUnmodifiedBoard) {
            setCurrentUnmodifiedBoard(unmodifiedInitialBoard);
        }
    }

    function compareBoards(): void {
        if (currentBoard) {
            if (currentUnmodifiedBoard) {
                const diff: Array<Reassignment> = BoardComparison.compare(currentUnmodifiedBoard, currentBoard);
                setReassignments(diff);
            } else {
                setUpCurrentUnmodifiedBoard();
            }
        }
    }

    const listOfHTMLReassignments: Array<JSX.Element> = reassignments.map((reassignment: Reassignment, index: number) => (
        mapsReassignments(reassignment, index)
    ));

    const containee: JSX.Element = <div className="reassignmentContainer">{listOfHTMLReassignments}</div>;

    return (
        <DrawerContainer drawerIcon="fas fa-user-check"
            containerTitle="Reassigned"
            containee={containee}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}
            numberForCountBadge={reassignments.length}/>
    );
}

function mapsReassignments(reassignment: Reassignment, index: number): JSX.Element {
    let oneWayReassignment: string | undefined;
    if (!reassignment.toProduct) {
        oneWayReassignment = `${reassignment.fromProduct!.name} assignment cancelled`;
    } else if (!reassignment.fromProduct) {
        oneWayReassignment = `Assigned to ${reassignment.toProduct.name}`;

    }

    return  <div key={index} className="reassignmentSection">
        <div className="name">{reassignment.person.name}</div>
        <div className="additionalInfo role">{reassignment.person.spaceRole ? reassignment.person.spaceRole.name : ''}</div>
        {!oneWayReassignment &&
        <div className="additionalInfo">{reassignment.fromProduct!.name} <i className="fas fa-long-arrow-alt-right"/> {reassignment.toProduct!.name}</div>
        }
        {oneWayReassignment &&
        <div className="additionalInfo">{oneWayReassignment}</div>
        }
    </div>;
}

const mapStateToProps = ({
    currentBoard,
    unmodifiedInitialBoards,
    boards,
}: GlobalStateProps) => ({
    currentBoard,
    unmodifiedInitialBoards,
    boards,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setUnmodifiedInitialBoards: (boards: Array<Board>) => dispatch(setUnmodifiedInitialBoardsAction(boards)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReassignedDrawer);
