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

import * as React from 'react';
import {useEffect, useState} from 'react';
import {createEmptySpace, Space} from '../Space/Space';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {
    fetchUserSpacesAction,
    setCurrentModalAction,
    setCurrentSpaceAction,
    setViewingDateAction,
} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import Header from '../Header/Header';
import SpaceDashboardTile from './SpaceDashboardTile';
import {GlobalStateProps} from '../Redux/Reducers';

import './SpaceDashboard.scss';
import Branding from '../ReusableComponents/Branding';
import {AvailableModals} from '../Modal/AvailableModals';
import AnnouncementBanner from '../Header/AnnouncementBanner';

interface SpaceDashboardProps {
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
    userSpaces: Array<Space>;
    setCurrentSpace(space: Space): Space;
    setCurrentDateOnState(): void;
}

function SpaceDashboard({
    setCurrentModal,
    fetchUserSpaces,
    userSpaces,
    setCurrentSpace,
    setCurrentDateOnState,
}: SpaceDashboardProps): JSX.Element {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [redirectPage, setRedirectPage] = useState<JSX.Element | null>(null);
    setCurrentDateOnState();

    function onCreateNewSpaceButtonClicked(): void {
        setCurrentModal({modal: AvailableModals.CREATE_SPACE});
    }

    function onSpaceClicked(space: Space): void {
        setRedirectPage(<Redirect to={`/${space.uuid}`}/>);
    }

    useEffect(() => {
        async function populateUserSpaces(): Promise<void> {
            await fetchUserSpaces();
        }

        window.history.pushState([], 'User Dashboard', '/user/dashboard');
        setCurrentSpace(createEmptySpace());

        populateUserSpaces().then(() => {
            setIsLoading(false);
        });
    }, [fetchUserSpaces, setCurrentSpace]);

    function WelcomeMessage(): JSX.Element {
        return (
            <div className="welcomeMessageContainer">
                <h1 className="welcomeMessageTitle">Welcome to PeopleMover!</h1>
                <h2 className="welcomeMessageSubtitle">Get started by creating your own space.</h2>
                <p className="welcomeMessageParagraph">
                    If you’re already a part of a space but you’re not seeing it here,
                    you’ll have to ask the owner to share it with you.
                </p>
                <NewSpaceButton/>
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
                <NewSpaceButton/>
            </div>
        );
    }

    function NewSpaceButton(): JSX.Element {
        return (
            <div>
                <button className="createNewSpaceButton" onClick={onCreateNewSpaceButtonClicked}>
                    <i className="material-icons createNewSpaceIcon" aria-hidden>
                        add_circle_outline
                    </i>
                    Create New Space
                </button>
            </div>
        );
    }

    if (redirectPage) return redirectPage;

    return (
        <div className="spaceDashboard">
            <AnnouncementBanner/>
            <Header hideSpaceButtons={true}/>
            <CurrentModal/>
            {!isLoading && (!userSpaces.length ? <WelcomeMessage/> : <SpaceTileGrid/>)}
            <Branding />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    userSpaces: state.userSpaces,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
    setCurrentDateOnState: () => dispatch(setViewingDateAction(new Date())),
});

export default connect(mapStateToProps, mapDispatchToProps)(SpaceDashboard);
/* eslint-enable */
