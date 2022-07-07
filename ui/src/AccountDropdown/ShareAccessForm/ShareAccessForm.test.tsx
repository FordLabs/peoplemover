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

import ShareAccessForm from './ShareAccessForm';
import {renderWithRecoil} from '../../Utils/TestUtils';
import React from 'react';
import TestData from '../../Utils/TestData';
import SpaceClient from '../../Space/SpaceClient';
import {screen, waitFor} from '@testing-library/react';
import {RecoilObserver} from '../../Utils/RecoilObserver';
import {ModalContents, ModalContentsState} from '../../State/ModalContentsState';
import {CurrentSpaceState} from '../../State/CurrentSpaceState';

jest.mock('Space/SpaceClient');

describe('Share Access Form', () => {
    let modalContent: ModalContents | null;

    beforeEach(async () => {
        modalContent = null;

        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContent = value;
                    }}
                />
                <ShareAccessForm />
            </>,
            ({set}) => {
                set(CurrentSpaceState, TestData.space)
                set(ModalContentsState, {
                    title: 'A Title',
                    component: <div>Some Component</div>,
                });
            }
        );
        await waitFor(() => expect(SpaceClient.getUsersForSpace).toHaveBeenCalled())
    })

    it('should toggle between the "Invite others to view" and "Invite others to edit" sections', () => {
        const inviteOthersToViewBtn = getInviteOthersToViewButton();
        expect(inviteOthersToViewBtn).toHaveTextContent('Invite others to view');
        const inviteOthersToEditBtn = getInviteOthersToEditButton();
        expect(inviteOthersToEditBtn).toHaveTextContent('Invite others to edit');

        expect(inviteOthersToViewBtn).toBeDisabled();
        inviteOthersToViewIsExpanded();
        expect(inviteOthersToEditBtn).not.toBeDisabled();
        inviteOthersToEditCollapsed();

        inviteOthersToEditBtn.click();

        expect(inviteOthersToViewBtn).not.toBeDisabled();
        inviteOthersToEditIsExpanded();
        expect(inviteOthersToEditBtn).toBeDisabled();
        inviteOthersToViewIsCollapsed();

        inviteOthersToViewBtn.click();

        expect(inviteOthersToViewBtn).toBeDisabled();
        inviteOthersToViewIsExpanded();
        expect(inviteOthersToEditBtn).not.toBeDisabled();
        inviteOthersToEditCollapsed();
    });

    describe('should close modal if user clicks the "x" from', () => {
        it('the expanded "Invite others to view" section', async () => {
            inviteOthersToViewIsExpanded();
            expect(modalContent).not.toBeNull();

            screen.getByTestId('modalCloseButton').click();

            await waitFor(() => expect(modalContent).toBeNull());
        });

        it('the expanded "Invite others to edit" section', async () => {
            getInviteOthersToEditButton().click();
            inviteOthersToEditIsExpanded();
            expect(modalContent).not.toBeNull();

            screen.getByTestId('modalCloseButton').click();

            await waitFor(() => expect(modalContent).toBeNull())
        });
    });
});

function inviteOthersToViewIsExpanded() {
    expect(screen.getByText('Copy link')).toBeDefined();
}

function inviteOthersToViewIsCollapsed() {
    expect(screen.queryByText('Copy link')).toBeNull();
}

function inviteOthersToEditIsExpanded() {
    expect(screen.getByText('Enter CDSID of your editors')).toBeDefined();
    expect(screen.getByText('user_id')).toBeDefined();
    expect(screen.getByText('user_id_2')).toBeDefined();
    expect(screen.getByText('Invite')).toBeDefined();
}

function inviteOthersToEditCollapsed() {
    expect(screen.queryByText('Enter CDSID of your editors')).toBeNull();
    expect(screen.queryByText('user_id')).toBeNull();
    expect(screen.queryByText('user_id_2')).toBeNull();
    expect(screen.queryByText('Invite')).toBeNull();
}

function getInviteOthersToViewButton() {
    return screen.getAllByTestId('multiModalExpandCollapseButton')[0]
}

function getInviteOthersToEditButton() {
    return screen.getAllByTestId('multiModalExpandCollapseButton')[1]
}