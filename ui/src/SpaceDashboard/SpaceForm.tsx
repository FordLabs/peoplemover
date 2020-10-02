/*
 * Copyright (c) 2020 Ford Motor Company
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
import {closeModalAction, fetchUserSpacesAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import SpaceClient from '../Space/SpaceClient';
import {createEmptySpace, Space} from '../Space/Space';
import FormButton from '../ModalFormComponents/FormButton';

import './SpaceForm.scss';

interface SpaceFormProps {
    space?: Space;
    closeModal(): void;
    fetchUserSpaces(): void;
}

function SpaceForm({
    space,
    closeModal,
    fetchUserSpaces,
}: SpaceFormProps): JSX.Element {
    const maxLength = 40;
    const editing = !!space;
    const [formSpace, setFormSpace] = useState<Space>(initializeSpace());

    function initializeSpace(): Space {
        return space ? space : createEmptySpace();
    }

    function handleSubmit(event: FormEvent): void {
        event.preventDefault();

        if (editing && formSpace.uuid) {
            SpaceClient.editSpace(formSpace.uuid, formSpace)
                .then(closeModal)
                .then(fetchUserSpaces);
        } else {
            SpaceClient.createSpaceForUser(formSpace.name)
                .then(closeModal)
                .then(fetchUserSpaces);
        }
    }

    function onSpaceNameFieldChanged(event: React.ChangeEvent<HTMLInputElement>): void {
        setFormSpace({
            ...formSpace,
            name: event.target.value,
        });
    }

    let spaceNameLength = formSpace.name.length;

    return (
        <form className="createSpaceContainer" onSubmit={handleSubmit}>
            <label className="createSpaceLabel" htmlFor="spaceNameField">Space Name</label>
            <input className="createSpaceInputField"
                id="spaceNameField"
                type="text"
                data-testid="createSpaceInputField"
                maxLength={maxLength}
                value={formSpace.name}
                onChange={onSpaceNameFieldChanged}/>
            <span className={`createSpaceFieldText ${spaceNameLength >= maxLength ? 'createSpaceFieldTooLong' : ''}`}
                data-testid="createSpaceFieldText">
                {spaceNameLength} ({maxLength} characters max)
            </span>
            <div className="createSpaceButtonContainer">
                <FormButton
                    buttonStyle="secondary"
                    onClick={closeModal}>
                    Cancel
                </FormButton>
                <FormButton
                    className="createSpaceSubmitButton"
                    buttonStyle="primary"
                    type="submit"
                    disabled={spaceNameLength <= 0}>
                    {editing ? 'Save' : 'Add Space'}
                </FormButton>
            </div>
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
});

export default connect(null, mapDispatchToProps)(SpaceForm);
/* eslint-enable */
