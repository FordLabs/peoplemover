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
import {fireEvent, render} from '@testing-library/react';
import Selector from '../ReusableComponents/Selector';
import TestUtils from './TestUtils';

describe('Selector component', () => {

    it('should render nothing if props have no selections', () => {
        const result = render(<Selector choices={[]} callback={TestUtils.dummyCallback}/>);

        expect(result.queryByText('a')).toBeNull();
        expect(result.queryByText('e')).toBeNull();
        expect(result.queryByText('i')).toBeNull();
        expect(result.queryByText('o')).toBeNull();
        expect(result.queryByText('u')).toBeNull();
    });

    it('should render one checkbox per item in props.selections', () => {
        const result = render(<Selector choices={['a', 'b']} callback={TestUtils.dummyCallback}/>);

        expect(result.getByLabelText('a')).toBeInTheDocument();
        expect(result.getByLabelText('b')).toBeInTheDocument();
    });

    it('should start with initially chosen things checked', () => {
        const result = render(<Selector choices={['a', 'b', 'c']} initiallyChosen={['a', 'c']} callback={TestUtils.dummyCallback}/>);

        expect((result.getByLabelText('a') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('b') as HTMLInputElement).checked).toBeFalsy();
        expect((result.getByLabelText('c') as HTMLInputElement).checked).toBeTruthy();
    });

    it('should record the users input accurately when a checkbox is clicked', () => {
        const result = render(<Selector choices={['a', 'b', 'c']} callback={TestUtils.dummyCallback}/>);

        expect((result.getByLabelText('a') as HTMLInputElement).checked).toBeFalsy();
        expect((result.getByLabelText('b') as HTMLInputElement).checked).toBeFalsy();
        expect((result.getByLabelText('c') as HTMLInputElement).checked).toBeFalsy();

        fireEvent.click(result.getByLabelText('a'));
        fireEvent.click(result.getByLabelText('b'));

        expect((result.getByLabelText('a') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('b') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('c') as HTMLInputElement).checked).toBeFalsy();
    });

    it('should record the users input accurately when a checkbox is unclicked', () => {
        const result = render(<Selector choices={['a', 'b', 'c']} callback={TestUtils.dummyCallback}/>);

        fireEvent.click(result.getByLabelText('a'));
        fireEvent.click(result.getByLabelText('b'));

        expect((result.getByLabelText('a') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('b') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('c') as HTMLInputElement).checked).toBeFalsy();

        fireEvent.click(result.getByLabelText('a'));

        expect((result.getByLabelText('a') as HTMLInputElement).checked).toBeFalsy();
        expect((result.getByLabelText('b') as HTMLInputElement).checked).toBeTruthy();
        expect((result.getByLabelText('c') as HTMLInputElement).checked).toBeFalsy();
    });

    it('should holler back when the choices change', () => {
        const whatever = jest.fn();
        const result = render(<Selector choices={['a', 'b', 'c']} callback={whatever}/>);

        expect(whatever).not.toHaveBeenCalled();

        fireEvent.click(result.getByLabelText('a'));
        expect(whatever).toHaveBeenCalledWith(['a']);

        fireEvent.click(result.getByLabelText('b'));
        expect(whatever).toHaveBeenCalledWith(['a', 'b']);
    });
});
