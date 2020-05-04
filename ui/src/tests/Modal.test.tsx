/*
 * Copyright (c) 2019 Ford Motor Company
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
import Modal from '../Modal/Modal';
import {render, fireEvent} from '@testing-library/react';

describe('Modal', () => {

    it('should close the modal when the escape key is pressed', () => {
        const mockedCloseFunction = jest.fn();
        const {getByTestId} = render(<Modal title={'Test Modal'} modalForm={<p>Hello</p>} closeModal={mockedCloseFunction}/>);
        fireEvent.keyDown(getByTestId('modalContainer'), { key: 'Escape', code: 27 });
        expect(mockedCloseFunction).toHaveBeenCalled();
    });

    it('should close the modal when the background is clicked', () => {
        const mockedCloseFunction = jest.fn();
        const {getByTestId} = render(<Modal title={'Test Modal'} modalForm={<p>Hello</p>} closeModal={mockedCloseFunction}/>);
        fireEvent.click(getByTestId('modalContainer'));
        expect(mockedCloseFunction).toHaveBeenCalled();
    });

    it('should not close the modal when the modal popup is clicked', () => {
        const mockedCloseFunction = jest.fn();
        const {getByTestId} = render(<Modal title={'Test Modal'} modalForm={<p>Hello</p>} closeModal={mockedCloseFunction}/>);
        fireEvent.click(getByTestId('modalPopupContainer'));
        expect(mockedCloseFunction).not.toHaveBeenCalled();
    });

});