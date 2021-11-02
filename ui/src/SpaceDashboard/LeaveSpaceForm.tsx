import * as React from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {closeModalAction, fetchUserSpacesAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals} from '../Modal/AvailableModals';

interface LeaveSpaceFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
}

function LeaveSpaceForm({space, closeModal, setCurrentModal, fetchUserSpaces}: LeaveSpaceFormProps): JSX.Element {
    const modalProps = {title: 'Are you sure?',
        content: <><div>As the owner of this space, leaving will permanently delete the space for yourself and all others that have access.</div>
            <div>Do you want to assign a new owner before leaving?</div></>,
        submitButtonLabel: 'Assign a new owner',
        closeButtonLabel: 'Leave & delete',
        submit(item?: unknown): void | Promise<void> {
            setCurrentModal({modal: AvailableModals.SHARE_SPACE_ACCESS, item: space});
        },
        close() {
            closeModal();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            SpaceClient.deleteSpaceByUuid(space.uuid!!).then(() => {
                fetchUserSpaces();
            });
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
