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
import MultiModalCardBanner from './MultiModalCardBanner';

describe('Multi Modal Card Banner', () => {
    let component: RenderResult;
    let buttonClickCallback: () => void;
    const testTitle = 'My NaMe Is PaTrIcK';

    beforeEach(() => {
        buttonClickCallback = jest.fn();
    });

    it('should show modal title', () => {
        component = render(
            <MultiModalCardBanner
                title={testTitle}
                onCloseBtnClick={buttonClickCallback}
            />
        );
        expect(component.queryByText(testTitle)).toBeInTheDocument();
    });

    it('should call button click callback method when close button is clicked', () => {
        component = render(
            <MultiModalCardBanner
                title={testTitle}
                onCloseBtnClick={buttonClickCallback}
                collapsed={false}
            />
        );
        component.getByTestId('modalCloseButton').click();
        expect(buttonClickCallback).toHaveBeenCalled();
    });

    describe('Arrow Icon', () => {
        it('should show "up" arrow icon', () => {
            component = render(
                <MultiModalCardBanner
                    title={testTitle}
                    onCloseBtnClick={buttonClickCallback}
                    collapsed={false}
                />
            );
            const actualArrowIcon = component.getByTestId('modalCardBannerArrowIcon');
            expect(actualArrowIcon.innerHTML).toEqual('keyboard_arrow_up');
        });

        it('should show "down" arrow icon', () => {
            component = render(
                <MultiModalCardBanner
                    title={testTitle}
                    collapsed
                    onCloseBtnClick={buttonClickCallback}
                />
            );
            const actualArrowIcon = component.getByTestId('modalCardBannerArrowIcon');
            expect(actualArrowIcon.innerHTML).toEqual('keyboard_arrow_down');
        });
    });

    describe('Header Wrapper', () => {
        it('should be a div when expanded', () => {
            component = render(
                <MultiModalCardBanner
                    title={testTitle}
                    collapsed={false}
                    onCloseBtnClick={buttonClickCallback}
                />
            );

            const headerWrapper = component.getByTestId('multiModalExpandCollapseButton');
            expect(headerWrapper.nodeName).toBe('DIV');
        });

        it('should be a button when collapsed which automagically inherits its parent component\'s onClick', () => {
            component = render(
                <MultiModalCardBanner
                    title={testTitle}
                    collapsed
                    onCloseBtnClick={buttonClickCallback}
                />
            );

            const headerWrapper = component.getByTestId('multiModalExpandCollapseButton');
            expect(headerWrapper.nodeName).toBe('BUTTON');
        });
    });
});
