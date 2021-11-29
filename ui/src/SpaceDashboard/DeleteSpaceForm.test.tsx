import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import * as React from 'react';
import {act, RenderResult} from '@testing-library/react';
import DeleteSpaceForm from './DeleteSpaceForm';
import {fireEvent} from '@testing-library/dom';
import SpaceClient from '../Space/SpaceClient';
import {AvailableActions, closeModalAction} from '../Redux/Actions';
import {applyMiddleware, createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import thunk from 'redux-thunk';
import {AvailableModals} from '../Modal/AvailableModals';

describe('Delete Space Form', () => {
    let form: RenderResult;
    let store: Store;

    describe('no editors', () => {
        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space}, applyMiddleware(thunk));
            store.dispatch = jest.fn();
            form = renderWithRedux(<DeleteSpaceForm space={TestUtils.space} spaceHasEditors={false}/>, store);
        });

        it('should not have an option to assign a new owner if the space has no editors', () => {
            expect(form.queryByText('Transfer Ownership')).not.toBeInTheDocument();
        });

    });

    describe('space has editors', () => {
        beforeEach(() => {
            store = createStore(rootReducer, {currentSpace: TestUtils.space}, applyMiddleware(thunk));
            store.dispatch = jest.fn();
            form = renderWithRedux(<DeleteSpaceForm space={TestUtils.space} spaceHasEditors={true}/>, store);
        });
        describe('things to display', () => {

            it('Should show copy and prompt "do you want to assign a new owner before leaving?"', () => {
                expect(form.getByText(/As owner of this space, deleting it will permanently remove it from all users' dashboards. This action cannot be undone./)).toBeInTheDocument();
                expect(form.getByText('If you\'d like to leave without deleting the space, please transfer ownership to a new owner.')).toBeInTheDocument();
            });

            it('should have an option to delete', () => {
                expect(form.getByText('Delete space')).toBeInTheDocument();
            });

            it('should have an option to assign new owner', () => {
                expect(form.getByText('Transfer Ownership')).toBeInTheDocument();
            });

            it('should stop showing the modal when the leave and delete button is pressed',  async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn(() => Promise.resolve());
                act(() => {
                    const bigRedButton = form.getByText('Delete space');
                    fireEvent.click(bigRedButton);
                });
                expect(store.dispatch).toBeCalledWith(closeModalAction());
            });

            it('should stop showing the modal when the close button is pressed',  async () => {
                SpaceClient.deleteSpaceByUuid = jest.fn(() => Promise.resolve());
                act(() => {
                    const bigRedButton = form.getByText('Cancel');
                    fireEvent.click(bigRedButton);
                });
                expect(store.dispatch).toBeCalledWith(closeModalAction());
            });
        });

        describe('things to do', () => {
            it('should call the space client when the leave and delete button is pressed with appropriate spaceId',  () => {
                SpaceClient.deleteSpaceByUuid = jest.fn(() => Promise.resolve());
                act(() => {
                    const bigRedButton = form.getByText('Delete space');
                    fireEvent.click(bigRedButton);
                });
                expect(SpaceClient.deleteSpaceByUuid).toHaveBeenCalledWith(TestUtils.space.uuid);
            });

            it('should open the Transfer Ownership modal when the assign a new owner button is pressed', () => {
                SpaceClient.deleteSpaceByUuid = jest.fn();
                act(() => {
                    const bigRedButton = form.getByText('Transfer Ownership');
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
});
