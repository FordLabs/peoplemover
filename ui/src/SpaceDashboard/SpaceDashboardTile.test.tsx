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
import SpaceClient from '../Space/SpaceClient';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';

describe('SpaceDashboardTile tests', () => {
    let component: RenderResult;
    let onClick: () => void;
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(async () => {
        jest.clearAllMocks();
        SpaceClient.getUsersForSpace = jest.fn(() => Promise.resolve(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            [{id: '1', userId: 'USER_ID', permission: 'owner', spaceUuid: TestUtils.space.uuid!!} as UserSpaceMapping, {id: '2', userId: 'USER_IDDQD', permission: 'editor', spaceUuid: TestUtils.space.uuid!!} as UserSpaceMapping]
        ));
        store = createStore(rootReducer, {currentUser: 'USER_ID'});
        store.dispatch = jest.fn();
        onClick = jest.fn();
        await act(async () => {
            component = renderWithRedux(
                <SpaceDashboardTile space={TestUtils.space} onClick={onClick}/>, store, undefined
            );
        });
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
            const editSpaceTile = await component.findByText('Edit');
            fireEvent.click(editSpaceTile);
        });
        expect(store.dispatch).toBeCalledWith(setCurrentModalAction({
            modal: AvailableModals.EDIT_SPACE,
            item: TestUtils.space,
        }));
    });

    describe('deleting a space', () => {
        it('should not show Delete Space menu item if user is not owner of the space', async () => {
            SpaceClient.getUsersForSpace = jest.fn(() => Promise.resolve(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [{id: '1', userId: 'USER_ID', permission: 'editor', spaceUuid: TestUtils.space.uuid!!} as UserSpaceMapping]
            ));
            await act(async () => {
                component.unmount();
                component = renderWithRedux(
                    <SpaceDashboardTile space={TestUtils.space} onClick={onClick}/>, store, undefined
                );
                const spaceEllipsis = await component.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
            });
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestUtils.space.uuid);
            expect(component.queryByText('Delete Space')).not.toBeInTheDocument();
        });

        it('should show the delete space modal on click', async () => {
            await act(async () => {
                const spaceEllipsis = await component.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
                const leaveSpaceTile = await component.findByText('Delete Space');
                fireEvent.click(leaveSpaceTile);
            });
            expect(store.dispatch).toBeCalledWith(setCurrentModalAction({
                modal: AvailableModals.DELETE_SPACE,
                item: TestUtils.space,
            }));
        });
    });

    describe('leaving a space', () => {

        it('should not show Leave Space menu item if user is not owner of the space', async () => {
            SpaceClient.getUsersForSpace = jest.fn(() => Promise.resolve(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [{id: '1', userId: 'USER_ID', permission: 'editor', spaceUuid: TestUtils.space.uuid!!} as UserSpaceMapping]
            ));
            await act(async () => {
                component.unmount();
                component = renderWithRedux(
                    <SpaceDashboardTile space={TestUtils.space} onClick={onClick}/>, store, undefined
                );
                const spaceEllipsis = await component.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
            });
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestUtils.space.uuid);
            expect(component.queryByText('Leave Space')).not.toBeInTheDocument();
        });

        it('should not show Leave Space menu item if space has no editors', async () => {
            SpaceClient.getUsersForSpace = jest.fn(() => Promise.resolve(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                [{id: '1', userId: 'USER_ID', permission: 'owner', spaceUuid: TestUtils.space.uuid!!} as UserSpaceMapping]
            ));
            await act(async () => {
                component.unmount();
                component = renderWithRedux(
                    <SpaceDashboardTile space={TestUtils.space} onClick={onClick}/>, store, undefined
                );
                const spaceEllipsis = await component.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
            });
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestUtils.space.uuid);
            expect(component.queryByText('Leave Space')).not.toBeInTheDocument();
        });

        it('should open leave space modal on click', async () => {
            await act(async () => {
                const spaceEllipsis = await component.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
                const leaveSpaceTile = await component.findByText('Leave Space');
                fireEvent.click(leaveSpaceTile);
            });
            expect(store.dispatch).toBeCalledWith(setCurrentModalAction({
                modal: AvailableModals.TRANSFER_OWNERSHIP,
                item: TestUtils.space,
            }));
        });
    });

    it('should focus the first dropdown option when opened', async () => {
        const spaceTileDropdownButton = await component.findByTestId('ellipsisButton');
        spaceTileDropdownButton.click();
        await wait(() => expect(component.getByTestId('editSpace')).toHaveFocus());
    });
});