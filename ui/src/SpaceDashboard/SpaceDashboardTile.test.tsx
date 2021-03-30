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

import {fireEvent, wait} from '@testing-library/dom';
import {RenderResult} from '@testing-library/react';
import {renderWithRedux} from '../tests/TestUtils';
import React from 'react';
import SpaceDashboardTile from './SpaceDashboardTile';
import TestUtils from '../tests/TestUtils';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {setCurrentModalAction} from '../Redux/Actions';
import {act} from 'react-dom/test-utils';
import {AvailableModals} from '../Modal/AvailableModals';

describe('SpaceDashboardTile tests', () => {
    let component: RenderResult;
    let onClick: () => void;
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(() => {
        store = createStore(rootReducer, {});
        store.dispatch = jest.fn();
        onClick = jest.fn();
        component = renderWithRedux(
            <SpaceDashboardTile space={TestUtils.space} onClick={onClick}/>, store, undefined
        );
    });

    it('should open space on click', async () => {
        const spaceTile = await component.findByTestId('spaceDashboardTile');
        fireEvent.click(spaceTile);
        expect(onClick).toBeCalled();
    });

    it('should open edit space modal on click', async () => {
        await act(async () => {
            const editSpaceEllipsis = await component.findByTestId('ellipsisButton');
            fireEvent.click(editSpaceEllipsis);
            const editSpaceTile = await component.findByTestId('editSpace');
            fireEvent.click(editSpaceTile);
        });
        expect(store.dispatch).toBeCalledWith(setCurrentModalAction({
            modal: AvailableModals.EDIT_SPACE,
            item: TestUtils.space,
        }));
    });

    it('should focus the first dropdown option when opened', async () => {
        const spaceTileDropdownButton = await component.findByTestId('ellipsisButton');
        spaceTileDropdownButton.click();
        await wait(() => expect(component.getByTestId('editSpace')).toHaveFocus());
    });
});
