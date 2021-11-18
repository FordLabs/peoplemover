import * as React from 'react';
import {Space} from '../Space/Space';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import SpaceClient from '../Space/SpaceClient';
import {closeModalAction, fetchUserSpacesAction, setCurrentModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';

interface DeleteSpaceWithNoEditorsFormProps {
    space: Space;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
}

function DeleteSpaceForm({space, closeModal, setCurrentModal, fetchUserSpaces}: DeleteSpaceWithNoEditorsFormProps): JSX.Element {
    const modalProps = {title: 'Are you sure?',
        containerClassname: 'leaveSpaceModal',
        content: <><div>Deleting this space will permanently remove it from PeopleMover.</div>
            <div>Are you sure you want to delete it?</div></>,
        submitButtonLabel: 'Delete Space',
        submit(item?: unknown): void | Promise<void> {
            SpaceClient.deleteSpaceByUuid(space.uuid!!).then(() => {
                fetchUserSpaces();
            });
            closeModal();
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

export default connect(null, mapDispatchToProps)(DeleteSpaceForm);
/* eslint-enable */
