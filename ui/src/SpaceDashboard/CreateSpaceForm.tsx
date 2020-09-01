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

import React, {FormEvent, useState} from 'react';
import {Dispatch} from 'redux';
import {closeModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import Cookies from 'universal-cookie';
import SpaceClient from './SpaceClient';

import './CreateSpaceForm.scss';

interface CreateSpaceFormProps {
    editing: boolean;
    onSubmit(): Promise<void>;
    closeModal(): void;
}

function CreateSpaceForm({
    onSubmit,
    closeModal,
}: CreateSpaceFormProps): JSX.Element {
    const maxLength = 40;
    const [spaceName, setSpaceName] = useState<string>('');

    async function addSpace(event: FormEvent): Promise<void> {
        event.preventDefault();
        const cookies = new Cookies();
        const accessToken = cookies.get('accessToken');

        await SpaceClient.createSpaceForUser(spaceName, accessToken);

        await onSubmit();
        closeModal();
    }

    function onSpaceNameFieldChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        setSpaceName(event.target.value);
    }

    return (
        <form className="createSpaceContainer" onSubmit={addSpace}>
            <label className="createSpaceLabel" htmlFor="spaceNameField">Space Name</label>
            <input className="createSpaceInputField"
                id="spaceNameField"
                type="text"
                data-testid="createSpaceInputField"
                maxLength={maxLength}
                value={spaceName}
                onChange={onSpaceNameFieldChanged}/>
            <span className={`createSpaceFieldText ${spaceName.length >= maxLength ? 'createSpaceFieldTooLong' : ''}`} data-testid="createSpaceFieldText">
                {spaceName.length} ({maxLength} characters max)
            </span>
            <div className="createSpaceButtonContainer">
                <button className="createSpaceCancelButton" type="button" onClick={closeModal}>Cancel</button>
                <button className="createSpaceSubmitButton" type="submit" disabled={spaceName.length <= 0}>Add Space</button>
            </div>
        </form>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(CreateSpaceForm);
