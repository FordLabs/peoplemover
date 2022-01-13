/*
 * Copyright (c) 2021 Ford Motor Company
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

import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import SpaceClient from '../Space/SpaceClient';
import {connect} from 'react-redux';
import {closeModalAction, fetchUserSpacesAction, setCurrentModalAction} from '../Redux/Actions';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import FormButton from '../ModalFormComponents/FormButton';
import {GlobalStateProps} from '../Redux/Reducers';
import {Space} from '../Space/Space';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import NotificationModal, {NotificationModalProps} from '../Modal/NotificationModal';
import {AvailableModals} from "../Modal/AvailableModals";
import fileDownload from "js-file-download";
import ReportClient from "../Reports/ReportClient";


interface BulkImportForm {
    currentSpace: Space;
    currentUser: string;
    closeModal(): void;
    setCurrentModal(modalState: CurrentModalState): void;
    fetchUserSpaces(): void;
}

interface BulkImportFormProps {
    space?: Space;
}

function BulkImportForm({currentSpace, currentUser, closeModal, setCurrentModal, fetchUserSpaces}: BulkImportForm, {space}: BulkImportFormProps): JSX.Element {
    const [selectedUser, setSelectedUser] = useState<UserSpaceMapping | null>(null);
    const [usersList, setUsersList] = useState<UserSpaceMapping[]>([]);
    const [me, setMe] = useState<UserSpaceMapping>();
    const [submitted, setSubmitted] = useState<boolean>(false);



    useEffect(() => {
        //empty for reason
    }, [currentSpace, setUsersList, currentUser]);


    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();

    };

    const handleFileUpload = (e: ChangeEvent): void =>{
        const target= e.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        console.log(file.name);
        return undefined;
    }

    const renderOption = (): JSX.Element => {

        return <div className={'bulkImportDownloadTemplate'}
            data-testid={'bulkImportDownloadTemplate'}>
            <a href={'pmBulkImportTemplate.csv'}> Download this PeopleMover Template <span className="material-icons">file_download</span></a>
            <div> Please do not change any column names. </div>
            <br/>
            <div>Upload the updated csv with your team information</div>
            <input type={'file'} accept={'.csv'} onChange={handleFileUpload}/>
        </div>;
    };

    const notificationModalProps = {content:<span>{'Ownership has been transferred to ' + selectedUser?.userId +
        ' and you have been removed from the space ' +
        currentSpace.name +
        '.'}</span>,
    title: 'Confirmed',
    close: closeModal} as NotificationModalProps;

    if (submitted) return (<NotificationModal {...notificationModalProps}/>);

    else return (
        <form className="transferOwnershipForm form" onSubmit={handleSubmit}>
            <>
                <div>
                    To add multiple people at one time, please use the PeopleMover template to upload a csv file.
                </div>
                <div className={'bulkImportFormContainer'}>
                    {renderOption()}
                </div>

                <div className="buttonsContainer">
                    <FormButton
                        buttonStyle="secondary"
                        className="cancelButton"
                        onClick={closeModal}>
                            Cancel
                    </FormButton>
                    <FormButton
                        type="submit"
                        buttonStyle="primary"
                        testId="bulkImportSubmitButton"
                        disabled={!selectedUser}
                    >
                           Done
                    </FormButton>
                </div>
            </>
        </form>
    );
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    closeModal: () => dispatch(closeModalAction()),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
    fetchUserSpaces: () => dispatch(fetchUserSpacesAction()),
});

const mapStateToProps = (state: GlobalStateProps, ownProps?: BulkImportFormProps) => ({
    currentSpace: ownProps?.space || state.currentSpace,
    currentUser: state.currentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(BulkImportForm);
/* eslint-enable */
