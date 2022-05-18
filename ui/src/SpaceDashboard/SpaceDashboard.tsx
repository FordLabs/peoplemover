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

import React, {useCallback, useEffect, useState} from 'react';
import {createEmptySpace, Space} from '../Space/Space';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {fetchUserSpacesAction, setCurrentModalAction, setCurrentSpaceAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';
import SpaceDashboardTile from './SpaceDashboardTile';
import {GlobalStateProps} from '../Redux/Reducers';

import './SpaceDashboard.scss';
import Branding from '../ReusableComponents/Branding';
import {AvailableModals} from '../Modal/AvailableModals';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';

interface SpaceDashboardProps {
    currentSpace: Space;
    userSpaces: Array<Space>;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
    setCurrentSpace(space: Space): Space;
}

function SpaceDashboard({
    currentSpace,
    setCurrentModal,
    fetchUserSpaces,
    userSpaces,
    setCurrentSpace,
}: SpaceDashboardProps): JSX.Element {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const setViewingDate = useSetRecoilState(ViewingDateState);

    function onCreateNewSpaceButtonClicked(): void {
        setCurrentModal({modal: AvailableModals.CREATE_SPACE});
    }

    const onSpaceClicked = useCallback((space: Space): void => {
        navigate(`/${space.uuid}`)
    }, [navigate])

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

    useEffect(() => {
        setViewingDate(new Date())

        if (currentSpace?.uuid) onSpaceClicked(currentSpace);
    }, [currentSpace, onSpaceClicked, setViewingDate]);

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
                {userSpaces.map((space, index) => (
                    <SpaceDashboardTile
                        key={index} space={space}
                        onClick={onSpaceClicked}
                    />
                ))}
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

    return (
        <div className="spaceDashboard">
            <CurrentModal/>
            {!isLoading && (!userSpaces.length ? <WelcomeMessage/> : <SpaceTileGrid/>)}
            <Branding />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    userSpaces: state.userSpaces,
    currentSpace: state.currentSpace,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SpaceDashboard);
/* eslint-enable */
