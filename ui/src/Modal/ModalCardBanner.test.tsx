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
import {render, RenderResult} from '@testing-library/react';
import ModalCardBanner from './ModalCardBanner';

describe('Modal Card Banner', () => {
    let component: RenderResult;
    let buttonClickCallback: () => void;
    const mockItem = {
        title: 'Modal Title',
        form: <div>Modal Form</div>,
    };

    beforeEach(() => {
        buttonClickCallback = jest.fn();
    });

    it('should show modal title', () => {
        component = render(
            <ModalCardBanner
                item={mockItem}
                onCloseBtnClick={buttonClickCallback}
            />
        );
        expect(component.queryByText(mockItem.title)).toBeInTheDocument();
    });

    it('should call button click callback method when close button is clicked', () => {
        component = render(
            <ModalCardBanner
                item={mockItem}
                onCloseBtnClick={buttonClickCallback}
            />
        );
        component.getByTestId('modalCloseButton').click();
        expect(buttonClickCallback).toHaveBeenCalled();
    });

    describe('Arrow Icon', () => {
        it('should show "up" arrow icon', () => {
            component = render(
                <ModalCardBanner
                    item={mockItem}
                    showArrowIcon={true}
                    arrowIconDirection="up"
                    onCloseBtnClick={buttonClickCallback}
                />
            );
            const actualArrowIcon = component.getByTestId('modalCardBannerArrowIcon');
            expect(actualArrowIcon.innerHTML).toEqual('keyboard_arrow_up');
        });

        it('should show "down" arrow icon', () => {
            component = render(
                <ModalCardBanner
                    item={mockItem}
                    showArrowIcon={true}
                    arrowIconDirection="down"
                    onCloseBtnClick={buttonClickCallback}
                />
            );
            const actualArrowIcon = component.getByTestId('modalCardBannerArrowIcon');
            expect(actualArrowIcon.innerHTML).toEqual('keyboard_arrow_down');
        });

        it('should hide arrow icon', () => {
            component = render(
                <ModalCardBanner
                    item={mockItem}
                    onCloseBtnClick={buttonClickCallback}
                />
            );
            const actualArrowIcon = component.queryByTestId('modalCardBannerArrowIcon');
            expect(actualArrowIcon).toBeNull();
        });
    });
});