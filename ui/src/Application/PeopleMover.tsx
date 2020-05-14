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

import './Styleguide/Styleguide.scss';
import './PeopleMover.scss';

import ProductGraveyard from '../Products/ProductGraveyard';
import ProductList from '../Products/ProductList';
import Branding from '../ReusableComponents/Branding';
import CurrentModal from '../Redux/Containers/ModalContainer';
import UnassignedDrawerContainer from '../Redux/Containers/UnassignedDrawerContainer';
import {connect} from 'react-redux';
import {fetchBoardsAction, setCurrentModalAction, setPeopleAction} from '../Redux/Actions';
import BoardSelectionTabs from '../Boards/BoardSelectionTabs';
import {ProductCardRefAndProductPair} from '../Products/ProductDnDHelper';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Board} from '../Boards/Board';
import {Person} from '../People/Person';
import PeopleClient from '../People/PeopleClient';
import Header from './Header';
import ReassignedDrawer from '../ReassignedDrawer/ReassignedDrawer';
import {Redirect} from 'react-router-dom';

export interface PeopleMoverProps {
    currentModal: CurrentModalState;
    currentBoard: Board;
    boards: Array<Board>;

    fetchBoards(): Promise<void>;

    setPeople(people: Array<Person>): Array<Person>;
}

function PeopleMover({
    currentModal,
    currentBoard,
    boards,
    fetchBoards,
    setPeople,
}: PeopleMoverProps): JSX.Element {
    const [redirect, setRedirect] = useState<JSX.Element>();

    function hasBoard() {
        return boards && boards.length > 0 && currentBoard;
    }

    useEffect(() => {
        RenderPage().then();
    }, [currentModal]);

    async function RenderPage(): Promise<void> {
        if (currentModal.modal === null) {
            try {
                await fetchBoards();
                const peopleInSpace = (await PeopleClient.getAllPeopleInSpace()).data;

                setPeople(peopleInSpace);
            } catch (err) {
                setRedirect(<Redirect to="/error/404"/>);
            }
        }
    }
    if (redirect) {
        return redirect;
    }
    return (
        !hasBoard() ? <></> : <div className="App">
            <div className={currentModal.modal !== null ? 'noOverflow' : ''}>

                <Header/>

                <BoardSelectionTabs/>

                <div className="productAndAccordionContainer">
                    <ProductList/>
                    <div className="accordionContainer">
                        <div className="accordionHeaderContainer">
                            <UnassignedDrawerContainer/>
                            <ReassignedDrawer/>
                            <ProductGraveyard products={currentBoard.products}/>
                        </div>
                    </div>
                </div>

                <CurrentModal/>

            </div>

            <Branding brand="FordLabs" message="Powered by"/>

        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentModal: state.currentModal,
    currentBoard: state.currentBoard,
    boards: state.boards,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchBoards: () => dispatch(fetchBoardsAction()),
    setPeople: (people: Array<Person>) => dispatch(setPeopleAction(people)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleMover);