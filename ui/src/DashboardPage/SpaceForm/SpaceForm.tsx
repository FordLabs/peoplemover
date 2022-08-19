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

import React, { createRef, FormEvent, useEffect, useState } from 'react';
import SpaceClient from 'Services/Api/SpaceClient';
import { createEmptySpace, Space } from 'Types/Space';

import FormButton from 'Common/FormButton/FormButton';
import { useSetRecoilState } from 'recoil';
import useFetchUserSpaces from 'Hooks/useFetchUserSpaces/useFetchUserSpaces';
import { CurrentSpaceState } from 'State/CurrentSpaceState';
import { ModalContentsState } from 'State/ModalContentsState';

import './SpaceForm.scss';

interface Props {
    selectedSpace?: Space;
}

function SpaceForm({ selectedSpace }: Props): JSX.Element {
    const setCurrentSpace = useSetRecoilState(CurrentSpaceState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const { fetchUserSpaces } = useFetchUserSpaces();

    const maxLength = 40;
    const [formSpace, setFormSpace] = useState<Space>(initializeSpace());
    const spaceNameInputRef = createRef<HTMLInputElement>();
    const [showWarningMessage, setShowWarningMessage] =
        useState<boolean>(false);

    useEffect(() => {
        spaceNameInputRef.current?.focus();
    });

    function closeModal() {
        setModalContents(null);
    }

    function initializeSpace(): Space {
        return selectedSpace ? selectedSpace : createEmptySpace();
    }

    function handleSubmit(event: FormEvent): void {
        event.preventDefault();

        if (formSpace.name.trim().length === 0) {
            setShowWarningMessage(true);
            return;
        }

        const spaceToSend = { ...formSpace, name: formSpace.name.trim() };

        if (!!selectedSpace && formSpace.uuid) {
            SpaceClient.editSpaceName(formSpace.uuid, spaceToSend)
                .then(closeModal)
                .then(fetchUserSpaces);
        } else {
            SpaceClient.createSpaceForUser(spaceToSend.name)
                .then((response) => setCurrentSpace(response.data.space))
                .then(closeModal);
        }
    }

    function onSpaceNameFieldChanged(
        event: React.ChangeEvent<HTMLInputElement>
    ): void {
        setFormSpace({
            ...formSpace,
            name: event.target.value,
        });
    }

    const spaceNameLength = formSpace.name.length;

    return (
        <form className="createSpaceContainer" onSubmit={handleSubmit}>
            <label className="createSpaceLabel" htmlFor="spaceNameField">
                Space Name
            </label>
            <input
                className="createSpaceInputField"
                id="spaceNameField"
                aria-describedby="createSpaceFieldText"
                type="text"
                data-testid="createSpaceInputField"
                maxLength={maxLength}
                value={formSpace.name}
                onChange={onSpaceNameFieldChanged}
                ref={spaceNameInputRef}
            />
            <span
                id="createSpaceFieldText"
                className={`createSpaceFieldText ${
                    spaceNameLength >= maxLength
                        ? 'createSpaceFieldTooLong'
                        : ''
                }`}
                data-testid="createSpaceFieldText"
            >
                {spaceNameLength} ({maxLength} characters max)
            </span>
            <div className="createSpaceErrorMessageContainer">
                {showWarningMessage && (
                    <span
                        data-testid="createSpaceErrorMessage"
                        className="createSpaceErrorMessage"
                    >
                        To create or rename a space, please enter an
                        alpha-numeric name.
                    </span>
                )}
            </div>
            <div className="createSpaceButtonContainer">
                <FormButton
                    buttonStyle="secondary"
                    type="button"
                    onClick={closeModal}
                >
                    Cancel
                </FormButton>
                <FormButton
                    className="createSpaceSubmitButton"
                    buttonStyle="primary"
                    type="submit"
                    disabled={spaceNameLength <= 0}
                    testId="createSpaceButton"
                >
                    {selectedSpace ? 'Save' : 'Create'}
                </FormButton>
            </div>
        </form>
    );
}

export default SpaceForm;
