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

import React, {useEffect, useState} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import moment, {now} from 'moment';
import {Space} from 'Types/Space';
import LeaveIcon from 'Assets/leave-icon.svg';
import AccessibleDropdownContainer from 'Common/AccessibleDropdownContainer/AccessibleDropdownContainer';
import SpaceClient from 'Services/Api/SpaceClient';
import {CurrentUserState} from 'State/CurrentUserState';
import {ModalContentsState} from 'State/ModalContentsState';
import SpaceForm from '../SpaceForm/SpaceForm';
import TransferOwnershipForm from '../TransferOwnershipForm/TransferOwnershipForm';
import DeleteSpaceForm from '../DeleteSpaceForm/DeleteSpaceForm';

import './SpaceTile.scss';
import DuplicateSpaceForm from "../DuplicateSpaceForm/DuplicateSpaceForm";

interface Props {
    space: Space;
    onClick: (space: Space) => void;
}

function SpaceTile({space, onClick: openSpace}: Props): JSX.Element {
    const currentUser = useRecoilValue(CurrentUserState);
    const setModalContents = useSetRecoilState(ModalContentsState);

    const spaceHtmlElementId = space.name.replace(' ', '-');
    const spaceEllipsisButtonId = `ellipsis-button-${spaceHtmlElementId}`;

    const [usersData, setUsersData] = useState<{ spaceHasEditors: boolean, isUserOwner: boolean } | null>(null)
    const [dropdownToggle, setDropdownToggle] = useState<boolean>(false);

    let timestamp: string;
    const nowStamp = now();
    const lastModifiedMoment = moment(space.lastModifiedDate);
    if (lastModifiedMoment.isSame(nowStamp, 'day')) {
        timestamp = lastModifiedMoment.format('[today at] h:mm a');
    } else {
        timestamp = lastModifiedMoment.format('dddd, MMMM D, YYYY [at] h:mm a');
    }

    useEffect(() => {
        SpaceClient.getUsersForSpace(space.uuid!).then((result) => {
            const isUserOwner = result.some(userSpaceMapping =>
                (currentUser && userSpaceMapping.userId.toUpperCase() === currentUser.toUpperCase() &&
                    userSpaceMapping.permission.toUpperCase() === 'OWNER')
            )
            const spaceHasEditors = result.some(userSpaceMapping => currentUser &&
                userSpaceMapping.userId.toUpperCase() !== currentUser.toUpperCase() &&
                userSpaceMapping.permission.toUpperCase() === 'EDITOR')

            setUsersData({ spaceHasEditors, isUserOwner })
        });

    }, [currentUser, space.uuid]);

    function handleDropdownClick(): void {
        setDropdownToggle(!dropdownToggle);
    }

    function openEditModal(): void {
        setModalContents({
            title: 'Edit Space',
            component: <SpaceForm selectedSpace={space}/>
        });
    }

    function openLeaveModal(): void {
        setModalContents( {
            title: 'Transfer Ownership of Space',
            component: <TransferOwnershipForm spaceToTransfer={space}/>
        });
    }

    function openDeleteModal(spaceHasEditors = false): void {
        setModalContents({
            title: "Are you sure?",
            component: <DeleteSpaceForm space={space} spaceHasEditors={spaceHasEditors}/>
        });
    }

    function openDuplicateModal(): void {
        setModalContents({
            title: "Are you sure?",
            component: <DuplicateSpaceForm space={space}/>
        });
    }

    const ActionsDropdownContent = (): JSX.Element => {
        const showLeaveSpaceButton = usersData?.isUserOwner && usersData?.spaceHasEditors;
        const showDeleteSpaceButton = usersData?.isUserOwner;

        return (
            <AccessibleDropdownContainer
                handleClose={(): void => {setDropdownToggle(false);}}
                className="ellipsisDropdownContainer"
                ariaLabelledBy={spaceEllipsisButtonId}
            >
                <button
                    autoFocus
                    data-testid="editSpace"
                    className="dropdownOptions"
                    role="menuitem"
                    onClick={openEditModal}
                >
                    <i className="material-icons" aria-hidden>edit</i>
                    Edit
                </button>
                {showLeaveSpaceButton && (
                    <button
                        data-testid="leaveSpace"
                        className="dropdownOptions"
                        role="menuitem"
                        onClick={openLeaveModal}
                    >
                        <img src={LeaveIcon} alt="" role="presentation" />
                        Leave Space
                    </button>
                )}
                {showDeleteSpaceButton && (
                    <button
                        data-testid="deleteSpace"
                        className="dropdownOptions"
                        role="menuitem"
                        onClick={() => openDeleteModal(usersData?.spaceHasEditors)}
                    >
                        <i className="material-icons" aria-hidden>delete</i>
                        Delete Space
                    </button>
                )}
                <button
                    data-testid="duplicateSpace"
                    className="dropdownOptions"
                    role="menuitem"
                    onClick={openDuplicateModal}
                >
                    <i className="material-icons" aria-hidden>content_copy</i>
                    Duplicate Space
                </button>
            </AccessibleDropdownContainer>
        );
    };

    const ActionsEllipsis = (): JSX.Element => {
        return (
            <div className="ellipsisButtonContainer">
                <button
                    id={spaceEllipsisButtonId}
                    aria-haspopup={true}
                    aria-expanded={false}
                    data-testid="ellipsisButton"
                    className="ellipsisButton"
                    aria-label={`Open Menu for Space ${space.name}`}
                    onClick={handleDropdownClick}
                >
                    <i className="material-icons" aria-hidden>more_vert</i>
                </button>
                {dropdownToggle && <ActionsDropdownContent/>}
            </div>
        );
    };

    return usersData ? (
        <div>
            <button className="spaceTile"
                data-testid="spaceDashboardTile"
                onClick={(): void => openSpace(space)}
            >
                <div className="spaceMetadata">
                    <div className="spaceName">{space.name}</div>
                    <div className="lastModifiedText">Last modified {timestamp}</div>
                </div>
            </button>
            <ActionsEllipsis/>
        </div>
    ) : <></>;
}

export default SpaceTile;