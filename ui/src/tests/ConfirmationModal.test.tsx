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

import ConfirmationModal from '../Modal/ConfirmationModal';
import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {noop} from '@babel/types';
import FormButton from '../ModalFormComponents/FormButton';

describe('the confirmation modal for deleting a board', () => {
    it('should call back properly when the archive button is clicked', async () => {
        let archiveClicked = false;
        const component = render(<ConfirmationModal
            content={<></>}
            close={noop}
            submit={(): void => undefined}
            secondaryButton={(
                <FormButton
                    buttonStyle="secondary"
                    testId="confirmationModalArchive"
                    onClick={(): void => {archiveClicked = true;}}>
                    Archive
                </FormButton>)}/>);

        expect(archiveClicked).toBeFalsy();
        fireEvent.click(component.getByTestId('confirmationModalArchive'));
        await expect(archiveClicked).toBeTruthy();
    });

    it('should not show the "Archive" option if you are deleting a person', () => {
        const component = render(<ConfirmationModal
            content={<></>}
            close={noop}
            submit={(): void => undefined}/>);
        expect(component.queryByText('Archive')).not.toBeInTheDocument();
    });

    it('should show the "Archive" option if you are deleting a product', () => {
        const productComponent = render(<ConfirmationModal
            content={<></>}
            close={noop}
            submit={(): void => undefined}
            secondaryButton={(
                <FormButton
                    buttonStyle="secondary"
                    testId="confirmationModalArchive"
                    onClick={noop}>
                   Archive
                </FormButton>)}/>);
        expect(productComponent.getByText('Archive')).toBeInTheDocument();
    });
});