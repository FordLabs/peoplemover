import * as React from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {Dispatch} from 'redux';
import {closeModalAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {AvailableModals} from '../Modal/AvailableModals';

interface LeaveSpaceFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
}

function LeaveSpaceForm({space, closeModal, setCurrentModal}: LeaveSpaceFormProps): JSX.Element {
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
            /* eslint-disable */
            return SpaceClient.deleteSpaceByUuid(space.uuid!!);
            /* eslint-enable */
        },
    } as ConfirmationModalProps;

    return (<ConfirmationModal {...modalProps}/>);

}

/* eslint-disable */
const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(LeaveSpaceForm);
/* eslint-enable */
