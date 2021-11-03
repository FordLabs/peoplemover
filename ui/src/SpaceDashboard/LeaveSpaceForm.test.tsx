import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import * as React from 'react';
import {act, RenderResult} from '@testing-library/react';
import LeaveSpaceForm from './LeaveSpaceForm';
import {fireEvent} from '@testing-library/dom';
import SpaceClient from '../Space/SpaceClient';
import {AvailableActions, closeModalAction} from '../Redux/Actions';
import {applyMiddleware, createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import thunk from 'redux-thunk';
import {AvailableModals} from '../Modal/AvailableModals';

describe('Space Form', () => {
    let form: RenderResult;
    let store: Store;
    beforeEach(() => {
        store = createStore(rootReducer, {currentSpace: TestUtils.space}, applyMiddleware(thunk));
        store.dispatch = jest.fn();
        form = renderWithRedux(<LeaveSpaceForm space={TestUtils.space}/>, store);
    });
    describe('things to display', () => {

        it('Should show copy and prompt "do you want to assign a new owner before leaving?"', () => {
            expect(form.getByText('As the owner of this space, leaving will permanently delete the space for yourself and all others that have access.')).toBeInTheDocument();
            expect(form.getByText('Do you want to assign a new owner before leaving?')).toBeInTheDocument();
        });

        it('should have an option to leave & delete', () => {
            expect(form.getByText('Leave & delete')).toBeInTheDocument();
        });

        it('should have an option to assign a new owner', () => {
            expect(form.getByText('Assign a new owner')).toBeInTheDocument();
        });
        it('should stop showing the modal when the leave and delete button is pressed',  async () => {
            SpaceClient.deleteSpaceByUuid = jest.fn(() => Promise.resolve());
            act(() => {
                const bigRedButton = form.getByText('Leave & delete');
                fireEvent.click(bigRedButton);
            });
            expect(store.dispatch).toBeCalledWith(closeModalAction());
        });
    });

    describe('things to do', () => {
        it('should call the space client when the leave and delete button is pressed with appropriate spaceId',  () => {
            SpaceClient.deleteSpaceByUuid = jest.fn(() => Promise.resolve());
            act(() => {
                const bigRedButton = form.getByText('Leave & delete');
                fireEvent.click(bigRedButton);
            });
            expect(SpaceClient.deleteSpaceByUuid).toHaveBeenCalledWith(TestUtils.space.uuid);
        });

        it('should open the Invite Others to Edit modal when the assign a new owner button is pressed', () => {
            SpaceClient.deleteSpaceByUuid = jest.fn();
            act(() => {
                const bigRedButton = form.getByText('Assign a new owner');
                fireEvent.click(bigRedButton);
            });
            expect(store.dispatch).toHaveBeenCalledWith({
                type: AvailableActions.SET_CURRENT_MODAL,
                modal: AvailableModals.TRANSFER_OWNERSHIP,
                item: TestUtils.space,
            });
        });
    });
});
