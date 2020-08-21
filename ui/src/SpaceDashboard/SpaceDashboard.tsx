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

import * as React from 'react';
import {useState} from 'react';
import SpaceClient from './SpaceClient';
import Cookies from 'universal-cookie';
import {Space} from './Space';
import plusIcon from '../Application/Assets/plus.svg';
import CurrentModal from '../Redux/Containers/ModalContainer';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import Header from '../Header/Header';
import SpaceDashboardTile from './SpaceDashboardTile';

import './SpaceDashboard.scss';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';

interface SpaceDashboardProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function SpaceDashboard({setCurrentModal}: SpaceDashboardProps): JSX.Element {
    const [userSpaces, setUserSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [redirectPage, setRedirectPage] = useState<JSX.Element | null >(null);

    function onCreateNewSpaceButtonClicked(): void {
        setCurrentModal({modal: AvailableModals.CREATE_SPACE, item: refreshUserSpaces});
    }

    async function refreshUserSpaces(): Promise<void> {
        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');
        const spaces = (await SpaceClient.getSpacesForUser(accessToken)).data;
        setUserSpaces(spaces);
    }

    function onSpaceClicked(space: Space): void {
        setRedirectPage(<Redirect to={`/${space.uuid}`}/>);
    }

    useOnLoad(() => {
        window.history.pushState([], 'User Dashboard', '/user/dashboard');
        refreshUserSpaces().then( () => {
            setIsLoading(false);
        });
    });

    function WelcomeMessage(): JSX.Element {
        return (
            <div className="welcomeMessageContainer">
                <h1 className="welcomeMessageTitle">Welcome to PeopleMover!</h1>
                <h2 className="welcomeMessageSubtitle">Get started by creating your own space.</h2>
                <p className="welcomeMessageParagraph">
                    If you’re already a part of a space but you’re not seeing it here,
                    you’ll have to ask the owner to share it with you.
                </p>
                <NewSpaceButton />
            </div>
        );
    }

    function SpaceTileGrid(): JSX.Element {
        return (
            <div className="userSpaceItemContainer">
                {
                    userSpaces.map((space, index) => {
                        return <SpaceDashboardTile
                            key={index} space={space}
                            onClick={onSpaceClicked}/>;
                    })
                }
                <NewSpaceButton />
            </div>
        );
    }

    function NewSpaceButton(): JSX.Element {
        return (
            <button className="createNewSpaceButton" onClick={onCreateNewSpaceButtonClicked}>
                <img className="createNewSpaceIcon" src={plusIcon} alt=""/>
                Create New Space
            </button>
        );
    }

    if ( redirectPage ) return redirectPage;

    return (
        <div className="spaceDashboard">
            <Header hideSpaceButtons={true}/>
            <CurrentModal/>
            {!isLoading && (!userSpaces.length ? <WelcomeMessage /> : <SpaceTileGrid /> )}
        </div>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceDashboard);
