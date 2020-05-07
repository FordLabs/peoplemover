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

import React, {useState} from 'react';
import {Dispatch} from 'redux';
import {closeModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import Cookies from 'universal-cookie';
import SpaceClient from './SpaceClient';

import './CreateSpaceForm.scss';

interface CreateSpaceFormProps {
    onSubmit(): Promise<void>;

    closeModal(): void;
}

function CreateSpaceForm({
    closeModal,
    onSubmit,
}: CreateSpaceFormProps): JSX.Element {

    const [spaceName, setSpaceName] = useState<string>('');

    async function addSpace(): Promise<void> {
        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');

        const spaceWithAccessTokenResponse = (await SpaceClient.createSpaceForUser(spaceName, accessToken)).data;
        cookies.set('accessToken', spaceWithAccessTokenResponse.accessToken, {path: '/'});

        onSubmit();
        closeModal();
    }

    function onSpaceNameFieldChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        setSpaceName(event.target.value.split(" ").join(""));
    }

    return  <div className={'createSpaceContainer'}>
        <label className={'createSpaceLabel'} htmlFor="spaceNameField">Space Name</label>
        <input className={'createSpaceInputField'} id="spaceNameField" type="text"  value={spaceName} onChange={onSpaceNameFieldChanged}/>

        <div className={'createSpaceButtonContainer'}>
            <button className={'createSpaceCancelButton'} onClick={closeModal}>Cancel</button>
            <button className={'createSpaceSubmitButton'} onClick={addSpace}>Add Space</button>
        </div>

    </div>;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(CreateSpaceForm);