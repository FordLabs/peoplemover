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
import {useEffect, useState} from 'react';
import SpaceClient from './SpaceClient';
import Cookies from 'universal-cookie';
import {Space} from './Space';
import './SpaceDashboard.scss';
import Header from '../Application/Header';
import plusIcon from '../Application/Assets/plus.svg';
import CurrentModal from '../Redux/Containers/ModalContainer';
import {AvailableModals, setCurrentModalAction} from '../Redux/Actions';
import {Dispatch} from 'redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {connect} from 'react-redux';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {Redirect} from 'react-router';
import SpaceDashboardTile from './SpaceDashboardTile';

interface SpaceDashboardProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function SpaceDashboard({setCurrentModal}: SpaceDashboardProps): JSX.Element {

    const [userSpaces, setUserSpaces] = useState<Space[]>([]);
    const [redirectPage, setRedirectPage] = useState<JSX.Element | null >(null);

    function onCreateNewSpaceButtonClicked(): void {
        setCurrentModal({modal: AvailableModals.CREATE_SPACE, item: refreshUserSpaces});
    }

    async function refreshUserSpaces(): Promise<void> {
        const accessToken = window.sessionStorage.getItem('accessToken')!!;
        const spaces = (await SpaceClient.getSpacesForUser(accessToken)).data;
        setUserSpaces(spaces);
    }

    function validateToken(): Promise<void> {
        const accessToken = window.sessionStorage.getItem('accessToken')!!;
        return AccessTokenClient.validateAccessToken(accessToken).then();
    }

    function onSpaceClicked(space: Space): void {
        setRedirectPage(<Redirect to={`/${space.name.toLowerCase()}`}/>);
    }

    useEffect(() => {
        validateToken()
            .then(() => {
                window.history.pushState([], 'User Dashboard', '/user/dashboard');
                refreshUserSpaces().then();
            })
            .catch(() => {
                setRedirectPage(<Redirect to={'/user/login'}/>);
            });

    }, []);

    if ( redirectPage ) {
        return redirectPage;
    }

    return <div>

        <Header hideSpaceButtons={true}/>

        <CurrentModal/>

        <div className={'user-space-item-container'}>
            {
                userSpaces.map((space, index) => {
                    return <SpaceDashboardTile key={index} space={space} onClick={onSpaceClicked}/>;
                })
            }
            <button className="create-new-space" onClick={onCreateNewSpaceButtonClicked}>
                <img className={'create-new-space-icon'} src={plusIcon}/>
                Create New Space
            </button>
        </div>

    </div>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(SpaceDashboard);
