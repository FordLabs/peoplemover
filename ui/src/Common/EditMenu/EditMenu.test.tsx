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

import {fireEvent, render} from '@testing-library/react';
import React from 'react';
import EditMenu, {EditMenuOption} from './EditMenu';

describe('The edit menu', () => {
    describe('for a person card', () => {
        const editPersonCallback = jest.fn();
        const markAsPlaceholderCallback = jest.fn();
        const cancelAssignmentCallback = jest.fn();
        const menuOptionList: EditMenuOption[] = [
            {
                callback: editPersonCallback,
                text: 'Edit Person',
                icon: 'account_circle',
            },
            {
                callback: markAsPlaceholderCallback,
                text: 'Mark as Placeholder',
                icon: 'create',

            },
            {
                callback: cancelAssignmentCallback,
                text: 'Cancel Assignment',
                icon: 'delete',
            },
        ];

        it('should render the right static content', async () => {
            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={jest.fn()}/>);

            await underTest.findByText('Edit Person');
            const firstIcon = await underTest.findByTestId('editMenuOption__edit_person');
            expect(firstIcon.innerHTML).toContain(menuOptionList[0].icon);

            await underTest.findByText('Mark as Placeholder');
            const secondIcon = await underTest.findByTestId('editMenuOption__mark_as_placeholder');
            expect(secondIcon.innerHTML).toContain(menuOptionList[1].icon);

            await underTest.findByText('Cancel Assignment');
            const thirdIcon = await underTest.findByTestId('editMenuOption__cancel_assignment');
            expect(thirdIcon.innerHTML).toContain(menuOptionList[2].icon);
        });

        it('should call the right callback when menu option is clicked', () => {
            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={jest.fn()}/>);
            expect(menuOptionList[0].callback).not.toHaveBeenCalled();
            fireEvent.click(underTest.getByText('Edit Person'));
            expect(menuOptionList[0].callback).toHaveBeenCalled();
        });
    });

    describe('for a product card', () => {
        it('should render the right static content', async () => {
            const menuOptionList: EditMenuOption[] = [
                {
                    callback: jest.fn(),
                    text: 'Edit product',
                    icon: 'create',
                },
                {
                    callback: jest.fn(),
                    text: 'Archive product',
                    icon: 'inbox',
                },
            ];
            const underTest = render(<EditMenu menuOptionList={menuOptionList} onClosed={jest.fn()}/>);
            await underTest.findByText('Edit product');
            const firstIcon = await underTest.findByTestId('editMenuOption__edit_product');
            expect(firstIcon.innerHTML).toContain(menuOptionList[0].icon);

            await underTest.findByText('Archive product');
            const secondIcon = await underTest.findByTestId('editMenuOption__archive_product');
            expect(secondIcon.innerHTML).toContain(menuOptionList[1].icon);
        });
    });
});
