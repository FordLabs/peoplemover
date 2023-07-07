import {ModalContents, ModalContentsState} from "../../State/ModalContentsState";
import {MutableSnapshot} from "recoil";
import {CurrentSpaceState} from "../../State/CurrentSpaceState";
import TestData from "../../Utils/TestData";
import * as React from "react";
import {renderWithRecoil} from "../../Utils/TestUtils";
import {RecoilObserver} from "../../Utils/RecoilObserver";
import {screen} from '@testing-library/dom';
import DuplicateSpaceForm from "./DuplicateSpaceForm";
import {fireEvent, waitFor} from "@testing-library/react";
import SpaceClient from "../../Services/Api/SpaceClient";

describe('Delete Space Form', () => {
    let modalContent: ModalContents | null;
    const initialRecoilState = ({set}: MutableSnapshot) => {
        set(ModalContentsState, {
            title: 'A Title',
            component: <div>Some Component</div>,
        });
        set(CurrentSpaceState, TestData.space)
    };

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
                <DuplicateSpaceForm space={TestData.space}/>
            </>,
            initialRecoilState
        );
    });

    describe('Things to display', () => {

        it('should show text to confirm the duplication request', () => {
            expect(screen.getByText(/Duplicating this space will create a copy of the space and everything in it/));
        });

        it('should have an option to duplicate', () => {
            expect(screen.getByText('Duplicate')).toBeInTheDocument();
        });

        it('should show a notification after Duplicate Space is pressed', async () => {
            const bigRedButton = screen.getByText('Duplicate');
            fireEvent.click(bigRedButton);

            expect(await screen.findByText('Confirmed')).toBeInTheDocument();
            expect(screen.getByText('testSpace has been duplicated')).toBeInTheDocument();
        });

        it('should close the modal after OK is pressed on the notification of duplication', async () => {
            SpaceClient.duplicateSpaceByUuid = jest.fn().mockResolvedValue(undefined);

            const bigRedButton = screen.getByText('Duplicate');
            fireEvent.click(bigRedButton);

            expect(modalContent).not.toBeNull();

            const okButton = await screen.findByText('Ok');
            fireEvent.click(okButton);

            await waitFor(() => expect(modalContent).toBeNull());
        });

        it('should stop showing the modal when the close button is pressed', async () => {
            expect(modalContent).not.toBeNull();

            const bigRedButton = screen.getByText('Cancel');
            fireEvent.click(bigRedButton);

            await waitFor(() => expect(modalContent).toBeNull());
        });

        it('should display an error message when the response from the api is a rejection', async () => {
            SpaceClient.duplicateSpaceByUuid = jest.fn().mockRejectedValue(undefined);

            const bigRedButton = screen.getByText('Duplicate');
            fireEvent.click(bigRedButton);

            await waitFor(() => expect(screen.getByText('testSpace already has a duplicate')).toBeInTheDocument());
        });
    });

    describe('Things to do', () => {
        it('should call the space client when the duplicate space button is pressed with the appropriate spaceId', async () => {
            SpaceClient.duplicateSpaceByUuid = jest.fn().mockResolvedValue({});

            const bigRedButton = await screen.getByText('Duplicate');
            fireEvent.click(bigRedButton);

            await waitFor(() => expect(SpaceClient.duplicateSpaceByUuid).toHaveBeenCalledWith(TestData.space.uuid));
        });
    });

});