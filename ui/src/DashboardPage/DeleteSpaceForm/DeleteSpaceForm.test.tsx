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
import TestData from 'Utils/TestData';
import * as React from 'react';
import {waitFor} from '@testing-library/react';
import DeleteSpaceForm from './DeleteSpaceForm';
import {fireEvent, screen} from '@testing-library/dom';
import SpaceClient from 'Services/Api/SpaceClient';
import {ModalContents, ModalContentsState} from 'State/ModalContentsState';
import {RecoilObserver} from 'Utils/RecoilObserver';
import TransferOwnershipForm from '../TransferOwnershipForm/TransferOwnershipForm';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {renderWithRecoil} from 'Utils/TestUtils';
import {MutableSnapshot} from 'recoil';

describe('Delete Space Form', () => {
    let modalContent: ModalContents | null;
    const initialRecoilState = ({set}: MutableSnapshot) => {
        set(ModalContentsState, {
            title: 'A Title',
            component: <div>Some Component</div>,
        });
        set(CurrentSpaceState, TestData.space)
    }

    describe('Space has no editors', () => {
        beforeEach(() => {
            SpaceClient.getSpacesForUser = jest.fn().mockResolvedValue([]);

            renderWithRecoil(
                <DeleteSpaceForm space={TestData.space} spaceHasEditors={false}/>,
                initialRecoilState
            );
        });

        it('should not have an option to assign a new owner if the space has no editors', () => {
            expect(screen.queryByText('Transfer Ownership')).toBeNull();
        });
    });

    describe('Space has editors', () => {
        beforeEach(() => {
            modalContent = null;
            renderWithRecoil(
                <>
                    <RecoilObserver
                        recoilState={ModalContentsState}
                        onChange={(value: ModalContents) => {
                            modalContent = value;
                        }}
                    />
                    <DeleteSpaceForm space={TestData.space} spaceHasEditors={true}/>
                </>,
                initialRecoilState
            );
        });

        describe('Things to display', () => {
            it('should show copy and prompt "do you want to assign a new owner before leaving?"', () => {
                expect(screen.getByText(/As owner of this space, deleting it will permanently remove it from all users' dashboards. This action cannot be undone./)).toBeInTheDocument();
                expect(screen.getByText('If you\'d like to leave without deleting the space, please transfer ownership to a new owner.')).toBeInTheDocument();
            });

            it('should have an option to delete', () => {
                expect(screen.getByText('Delete space')).toBeInTheDocument();
            });

            it('should have an option to assign new owner', () => {
                expect(screen.getByText('Transfer Ownership')).toBeInTheDocument();
            });

            it('should show a notification after Leave and Delete is pressed', async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn().mockResolvedValue(undefined);

                const bigRedButton = screen.getByText('Delete space');
                fireEvent.click(bigRedButton);

                expect(await screen.findByText('Confirmed')).toBeInTheDocument();
                expect(screen.getByText('testSpace has been deleted from PeopleMover.')).toBeInTheDocument();
            });

            it('should close the modal after OK is pressed on the notification of deletion', async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn().mockResolvedValue(undefined);

                const bigRedButton = screen.getByText('Delete space');
                fireEvent.click(bigRedButton);

                expect(modalContent).not.toBeNull();

                const okButton = await screen.findByText('Ok');
                fireEvent.click(okButton);

                await waitFor(() => expect(modalContent).toBeNull());
            });

            it('should stop showing the modal when the close button is pressed', async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn().mockResolvedValue(undefined);

                expect(modalContent).not.toBeNull();

                const bigRedButton = screen.getByText('Cancel');
                fireEvent.click(bigRedButton);

                await waitFor(() => expect(modalContent).toBeNull());
            });
        });

        describe('Things to do', () => {
            it('should call the space client when the leave and delete button is pressed with appropriate spaceId', async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn().mockResolvedValue({});

                const bigRedButton = await screen.getByText('Delete space');
                fireEvent.click(bigRedButton);

                await waitFor(() => expect(SpaceClient.deleteSpaceByUuid).toHaveBeenCalledWith(TestData.space.uuid));
            });

            it('should open the Transfer Ownership modal when the assign a new owner button is pressed', async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn();

                const bigRedButton = screen.getByText('Transfer Ownership');
                fireEvent.click(bigRedButton);

                await waitFor(() => expect(modalContent).toEqual({
                    title: 'Transfer Ownership of Space',
                    component: <TransferOwnershipForm spaceToTransfer={TestData.space}/>
                }));
            });
        });
    });
});
