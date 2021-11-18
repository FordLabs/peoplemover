import * as React from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {closeModalAction, fetchUserSpacesAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals} from '../Modal/AvailableModals';
import FormButton from '../ModalFormComponents/FormButton';

interface LeaveSpaceFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
}

function LeaveSpaceForm({space, closeModal, setCurrentModal, fetchUserSpaces}: LeaveSpaceFormProps): JSX.Element {
    const modalProps = {title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <><div>As the owner of this space, leaving will permanently delete the space for yourself and all others that have access.</div>
            <div>Do you want to assign a new owner before leaving?</div></>,
        submitButtonLabel: 'Assign a new owner',
        secondaryButton: (
            <FormButton
                buttonStyle="secondary"
                testId="confirmationModalLeaveAndDeleteSpace"
                onClick={(): void => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    SpaceClient.deleteSpaceByUuid(space.uuid!!).then(() => {
                        fetchUserSpaces();
                    });
                    closeModal();
                }}>
            Leave & delete
            </FormButton>),
        submit(item?: unknown): void | Promise<void> {
            setCurrentModal({modal: AvailableModals.TRANSFER_OWNERSHIP, item: space});
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    return (<ConfirmationModal {...modalProps}/>);

}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
});

export default connect(null, mapDispatchToProps)(LeaveSpaceForm);
/* eslint-enable */
