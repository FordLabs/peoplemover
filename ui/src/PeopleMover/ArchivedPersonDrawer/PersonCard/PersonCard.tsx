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

import React from 'react';
import {createDataTestId} from 'Utils/ReactUtils';
import PersonAndRoleInfo from 'Assignments/PersonAndRoleInfo/PersonAndRoleInfo';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import PersonForm from 'Common/PersonForm/PersonForm';
import {ModalContentsState} from 'State/ModalContentsState';
import {Person} from 'Types/Person';

import 'Styles/Main.scss';
import './PersonCard.scss';

interface Props {
    person: Person;
}

function PersonCard({ person }: Props): JSX.Element {
    const setModalContents = useSetRecoilState(ModalContentsState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);

    function toggleModal(): void {
        if (!isReadOnly) {
            setModalContents({
                title: 'Edit Person',
                component: <PersonForm
                    isEditPersonForm
                    personEdited={person}
                />,
            });
        }
    }

    function handleKeyPress(event: React.KeyboardEvent): void {
        if (event.key === 'Enter') {
            toggleModal();
        }
    }

    return (
        <div
            className={'archivedPersonCard'}
            data-testid={createDataTestId('archivedPersonCard', person.name)}
        >
            <div onClick={toggleModal} className={'archivedPersonContainer'} onKeyPress={handleKeyPress} data-testid={createDataTestId('archivedPersonContainer', person.name)}>
                <PersonAndRoleInfo
                    person={person}
                    duration={NaN}
                    isUnassignedProduct={false}
                />
                <button
                    className="archivedPersonRoleColor"
                    aria-label="Person Menu"
                    disabled={isReadOnly}
                    style={{backgroundColor: 'transparent'}}
                    onClick={toggleModal}
                >
                    {!isReadOnly && (
                        <i className="material-icons archivedPersonEditIcon greyIcon" aria-hidden>
                            more_vert
                        </i>
                    )}
                </button>
            </div>
        </div>
    );
}

export default PersonCard;
