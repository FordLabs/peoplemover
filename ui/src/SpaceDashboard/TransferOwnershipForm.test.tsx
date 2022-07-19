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
import {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import TransferOwnershipForm from './TransferOwnershipForm';
import SpaceClient from '../Services/Api/SpaceClient';
import {fireEvent, screen} from '@testing-library/dom';
import {waitFor} from '@testing-library/react';
import {CurrentUserState} from '../State/CurrentUserState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';
import {RecoilObserver} from '../Utils/RecoilObserver';

jest.mock('Services/Api/SpaceClient');

describe('Transfer Ownership Form', () => {
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
                <TransferOwnershipForm spaceToTransfer={TestData.space}/>
            </>,
            ({set}) => {
                set(CurrentUserState,  'user_id')
                set(ModalContentsState, {
                    title: 'A Title',
                    component: <div>Some Component</div>,
                });
            }
        );

        await waitFor(() => expect(SpaceClient.getUsersForSpace).toHaveBeenCalled());
    });

    it('should prompt the choice with the space name', () => {
        expect(screen.getByText('Please choose who you would like to be the new owner of ' + TestData.space.name)).toBeDefined();
    });

    it('should show each editors name', () => {
        expect(screen.getByText('user_id_2')).toBeInTheDocument();
        expect(screen.queryByText('user_id')).not.toBeInTheDocument();
    });

    it('should not allow submission before an editor is chosen (the modal does not close)', () => {
        screen.getByText('Transfer ownership').click();
        expect(screen.getByText(/Please choose who you would like/)).toBeInTheDocument();
    });

    it('should close the modal when cancel is clicked', () => {
        expect(modalContent).not.toBeNull();
        fireEvent.click(screen.getByText('Cancel'));
        expect(modalContent).toBeNull();
    });

    describe('The happy path', () => {
        it('should close the modal when a persons name is clicked and Transfer button, then OK is pressed on the confirmation', async () => {
            fireEvent.click(screen.getByText('user_id_2'));
            fireEvent.click(screen.getByText('Transfer ownership'));
            await screen.findByText('Ownership has been transferred to user_id_2 and you have been removed from the space testSpace.');
            expect(modalContent).not.toBeNull();
            fireEvent.click(screen.getByText('Ok'));
            expect(modalContent).toBeNull();
        });

        it('should be able to choose a person by clicking anywhere in their row', async () => {
            fireEvent.click(screen.getByTestId('transferOwnershipFormRadioControl-user_id_2'));
            fireEvent.click(screen.getByText('Transfer ownership'));
            expect(modalContent).not.toBeNull();
            fireEvent.click(await screen.findByText('Ok'));
            expect(modalContent).toBeNull();
        });

        it('should use the Client to promote the selected editor to owner', async () => {
            fireEvent.click(screen.getByText('user_id_2'));
            fireEvent.click(screen.getByText('Transfer ownership'));
            await waitFor(() =>
                expect(SpaceClient.changeOwner).toHaveBeenCalledWith(TestData.space, TestData.spaceMappingsArray[0], TestData.spaceMappingsArray[1])
            );
        });

        it('should use the Client to remove the current users permissions from the space', async () => {
            fireEvent.click(screen.getByText('user_id_2'));
            fireEvent.click(screen.getByText('Transfer ownership'));
            await waitFor(() => expect(SpaceClient.removeUser).toHaveBeenCalledWith(TestData.space, TestData.spaceMappingsArray[0]));
        });

        it('should refresh user spaces if a new owner is assigned', async () => {
            const user2RadioButton = screen.getByTestId('transferOwnershipFormRadioControl-user_id_2')
            fireEvent.click(user2RadioButton);

            const transferOwnershipButton = await screen.findByText('Transfer ownership')
            fireEvent.click(transferOwnershipButton);

            await waitFor(() => expect(SpaceClient.changeOwner).toHaveBeenCalled());
            await waitFor(() => expect(SpaceClient.removeUser).toHaveBeenCalled());
            await waitFor(() => expect(SpaceClient.getSpacesForUser).toHaveBeenCalled());
        });
    });
});

