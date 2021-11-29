import * as React from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {closeModalAction, fetchUserSpacesAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals} from '../Modal/AvailableModals';
import FormButton from '../ModalFormComponents/FormButton';

interface DeleteSpaceFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
    spaceHasEditors?: boolean;
}

function DeleteSpaceForm({space, closeModal, setCurrentModal, fetchUserSpaces, spaceHasEditors}: DeleteSpaceFormProps): JSX.Element {
    const propsWithEditors = {title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <><div>As owner of this space, deleting it will permanently remove it from all users&apos; dashboards. This action cannot be undone.</div>
            <div>If you&apos;d like to leave without deleting the space, please transfer ownership to a new owner.</div></>,
        submitButtonLabel: 'Transfer Ownership',
        secondaryButton: (
            <FormButton
                buttonStyle="redalert"
                testId="confirmationModalLeaveAndDeleteSpace"
                onClick={(): void => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    SpaceClient.deleteSpaceByUuid(space.uuid!!).then(() => {
                        fetchUserSpaces();
                    });
                    closeModal();
                }}>
            Delete space
            </FormButton>),
        submit(item?: unknown): void | Promise<void> {
            setCurrentModal({modal: AvailableModals.TRANSFER_OWNERSHIP, item: space});
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    const propsWithoutEditors = {title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <><div>Deleting this space will permanently remove it from PeopleMover.</div>
            <div>Are you sure you want to delete it?</div></>,
        submitButtonLabel: 'Delete Space',
        submit(item?: unknown): void | Promise<void> {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            SpaceClient.deleteSpaceByUuid(space.uuid!!).then(() => {
                fetchUserSpaces();
            });
            setCurrentModal({modal: AvailableModals.DELETE_SPACE_CONFIRMATION, item: space});
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    if (spaceHasEditors === undefined || spaceHasEditors) {
        return (<ConfirmationModal {...propsWithEditors}/>);
    } else {
        return (<ConfirmationModal {...propsWithoutEditors}/>);
    }

}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
});

export default connect(null, mapDispatchToProps)(DeleteSpaceForm);
/* eslint-enable */