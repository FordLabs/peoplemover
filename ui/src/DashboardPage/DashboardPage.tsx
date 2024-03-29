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
import {createEmptySpace, Space} from 'Types/Space';
import SpaceTile from './SpaceTile/SpaceTile';

import Branding from 'Common/Branding/Branding';
import {useNavigate} from 'react-router-dom';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import useFetchUserSpaces from 'Hooks/useFetchUserSpaces/useFetchUserSpaces';
import {ModalContentsState} from 'State/ModalContentsState';
import SpaceForm from './SpaceForm/SpaceForm';
import Modal from '../Modal/Modal';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import Header from 'Common/Header/Header';

import './DashboardPage.scss';

function DashboardPage(): JSX.Element {
    const navigate = useNavigate();

    const setModalContents = useSetRecoilState(ModalContentsState);
    const setViewingDate = useSetRecoilState(ViewingDateState);
    const [currentSpace, setCurrentSpace] = useRecoilState(CurrentSpaceState);

    const { userSpaces, fetchUserSpaces } = useFetchUserSpaces();

    const [isLoading, setIsLoading] = useState<boolean>(true);

    function onCreateNewSpaceButtonClicked(): void {
        setModalContents({title: 'Create New Space', component: <SpaceForm/>});
    }

    const onSpaceClicked = useCallback((space: Space): void => {
        navigate(`/${space.uuid}`)
    }, [navigate])

    useEffect(() => {
        window.history.pushState([], 'User Dashboard', '/user/dashboard');
        setCurrentSpace(createEmptySpace());

        fetchUserSpaces().then(() => {
            setIsLoading(false)
        })
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
                    <SpaceTile
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
        <>
            <Header onlyShowSignOutButton showStaticPeopleMoverLogo />
            <div className="spaceDashboard">
                {!isLoading && (!userSpaces.length ? <WelcomeMessage/> : <SpaceTileGrid/>)}
                <Branding />
                <Modal />
            </div>
        </>
    );
}

export default DashboardPage;
