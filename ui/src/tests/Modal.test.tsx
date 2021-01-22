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

import React from 'react';
import {render, fireEvent, RenderResult} from '@testing-library/react';
import Modal from '../Modal/Modal';

describe('Modal', () => {
    let mockedCloseFunction: jest.Mock, comp: RenderResult;

    beforeEach(() => {
        mockedCloseFunction = jest.fn();

        const ModalForm = (props: { setShouldShowConfirmCloseModal: Function }): JSX.Element => {
            props.setShouldShowConfirmCloseModal();
            return <p>Hello</p>;
        };

        comp = render(
            <Modal
                title="Test Modal"
                modalForm={<ModalForm setShouldShowConfirmCloseModal={(): void => {
                    console.log('hey');
                }}/>}
                closeModal={mockedCloseFunction}
            />
        );
    });

    it('should close the modal when the escape key is pressed', () => {
        fireEvent.keyDown(comp.getByTestId('modalContainer'), {key: 'Escape', code: 27});
        expect(mockedCloseFunction).toHaveBeenCalled();
    });

    it('should close the modal when the background is clicked', () => {
        fireEvent.click(comp.getByTestId('modalContainer'));
        expect(mockedCloseFunction).toHaveBeenCalled();
    });

    it('should close the modal when the X is clicked', () => {
        fireEvent.click(comp.getByTestId('modalCloseButton'));
        expect(mockedCloseFunction).toHaveBeenCalled();
    });

    it('should not close the modal when the modal popup is clicked', () => {
        fireEvent.click(comp.getByTestId('modalPopupContainer'));
        expect(mockedCloseFunction).not.toHaveBeenCalled();
    });
});
