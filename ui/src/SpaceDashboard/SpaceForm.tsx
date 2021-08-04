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

import React, {FormEvent, useState, useEffect, createRef} from 'react';
import {closeModalAction, fetchUserSpacesAction, setCurrentSpaceAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import SpaceClient from '../Space/SpaceClient';
import {createEmptySpace, Space} from '../Space/Space';
import FormButton from '../ModalFormComponents/FormButton';

import './SpaceForm.scss';

interface SpaceFormProps {
    space?: Space;

    closeModal(): void;

    fetchUserSpaces(): void;

    setCurrentSpace(space: Space): void;
}

function SpaceForm({
    space,
    closeModal,
    fetchUserSpaces,
    setCurrentSpace,
}: SpaceFormProps): JSX.Element {
    const maxLength = 40;
    const [formSpace, setFormSpace] = useState<Space>(initializeSpace());
    const spaceNameInputRef = createRef<HTMLInputElement>();
    const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);

    useEffect(() => {
        spaceNameInputRef.current?.focus();
    });

    function initializeSpace(): Space {
        return space ? space : createEmptySpace();
    }

    function handleSubmit(event: FormEvent): void {
        event.preventDefault();

        if (formSpace.name.trim().length === 0) {
            setShowWarningMessage(true);
        }

        if (!!space && formSpace.uuid) {
            SpaceClient.editSpaceName(formSpace.uuid, formSpace, space.name)
                .then(closeModal)
                .then(fetchUserSpaces);
        } else {
            SpaceClient.createSpaceForUser(formSpace.name)
                .then((response) => setCurrentSpace(response.data.space))
                .then(closeModal);
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
                aria-describedby="createSpaceFieldText"
                type="text"
                data-testid="createSpaceInputField"
                maxLength={maxLength}
                value={formSpace.name}
                onChange={onSpaceNameFieldChanged}
                ref={spaceNameInputRef}
            />
            <span id="createSpaceFieldText"
                className={`createSpaceFieldText ${spaceNameLength >= maxLength ? 'createSpaceFieldTooLong' : ''}`}
                data-testid="createSpaceFieldText">
                {spaceNameLength} ({maxLength} characters max)
            </span>
            <div className="createSpaceErrorMessageContainer">
                {showWarningMessage && <span data-testid="createSpaceErrorMessage" className="createSpaceErrorMessage">
                      To create or rename a space, please enter an alpha-numeric name.
                </span>}
            </div>
            <div className="createSpaceButtonContainer">
                <FormButton
                    buttonStyle="secondary"
                    type="button"
                    onClick={closeModal}>
                    Cancel
                </FormButton>
                <FormButton
                    className="createSpaceSubmitButton"
                    buttonStyle="primary"
                    type="submit"
                    disabled={spaceNameLength <= 0}
                    testId="createSpaceButton">
                    {space ? 'Save' : 'Create'}
                </FormButton>
            </div>
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
});

export default connect(null, mapDispatchToProps)(SpaceForm);
/* eslint-enable */
