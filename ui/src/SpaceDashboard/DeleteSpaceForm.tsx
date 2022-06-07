import * as React from 'react';
import {useState} from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals} from '../Modal/AvailableModals';
import FormButton from '../ModalFormComponents/FormButton';
import NotificationModal, {NotificationModalProps} from '../Modal/NotificationModal';
import './DeleteSpaceForm.scss';
import useFetchUserSpaces from '../Hooks/useFetchUserSpaces';

interface DeleteSpaceFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    spaceHasEditors?: boolean;
}

function DeleteSpaceForm({
    space,
    closeModal,
    setCurrentModal,
    spaceHasEditors,
}: DeleteSpaceFormProps): JSX.Element {
    const { fetchUserSpaces } = useFetchUserSpaces();

    const [submitted, setSubmitted] = useState<boolean>(false);

    const notificationModalProps = {
        content: <span>{space.name + ' has been deleted from PeopleMover.'
        }</span>,
        title: 'Confirmed',
        close: closeModal,
    } as NotificationModalProps;

    const propsWithEditors = {
        title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <>
            <div>As owner of this space, deleting it will permanently remove it from all users&apos; dashboards. This
                action cannot be undone.
            </div>
            <br/>
            <div>If you&apos;d like to leave without deleting the space, please transfer ownership to a new owner.</div>
        </>,
        submitButtonLabel: 'Transfer Ownership',
        secondaryButton: (
            <FormButton
                buttonStyle="redalert"
                testId="confirmationModalLeaveAndDeleteSpace"
                onClick={(): void => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    SpaceClient.deleteSpaceByUuid(space.uuid!).then(() => {
                        fetchUserSpaces().catch();
                        setSubmitted(true);
                    });
                }}>
                Delete space
            </FormButton>),
        submit(): void | Promise<void> {
            setCurrentModal({modal: AvailableModals.TRANSFER_OWNERSHIP, item: space});
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    const propsWithoutEditors = {
        title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <>
            <div>Deleting this space will permanently remove it from PeopleMover.</div>
            <br/>
            <div>Are you sure you want to delete it?</div>
        </>,
        submitButtonLabel: 'Delete Space',
        primaryButtonStyle: 'redalert',
        submit(): void | Promise<void> {
            SpaceClient.deleteSpaceByUuid(space.uuid!).then(() => {
                fetchUserSpaces();
                setSubmitted(true);
            });
        },
        close() {
            closeModal();
        },
    } as ConfirmationModalProps;

    if (submitted) {
        return (<NotificationModal {...notificationModalProps}/>);
    } else if (spaceHasEditors === undefined || spaceHasEditors) {
        return (<ConfirmationModal {...propsWithEditors}/>);
    } else {
        return (<ConfirmationModal {...propsWithoutEditors}/>);
    }

}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(DeleteSpaceForm);
/* eslint-enable */
