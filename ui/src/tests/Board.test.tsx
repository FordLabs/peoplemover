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
import PeopleMover from '../Application/PeopleMover';
import BoardClient from '../Boards/BoardClient';
import TestUtils, {renderWithRedux} from './TestUtils';
import {applyMiddleware, compose, createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import {wait} from '@testing-library/dom';
import thunk from 'redux-thunk';
import {act} from '@testing-library/react';
import {AxiosResponse} from 'axios';
import {Board} from '../Boards/Board';
import {BOARD_PREFIX_TO_HIDE_DURING_TRANSITION} from '../Redux/Actions';

describe('Boards', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('showing boards at startup', () => {

        it('should show the Flabs branding on load', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('Powered by');
            await app.findByText('FordLabs');
        });

        it('should use client to get all boards for space on component will mount', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('Product 1');
            expect(app.queryByText('Product 2')).not.toBeInTheDocument();
        });

        describe('TRANSITION', () => {
            const hiddenBoardName = `${BOARD_PREFIX_TO_HIDE_DURING_TRANSITION}dontshowup`;

            beforeEach(() => {
                const boardWithPrefix: Board = {
                    id: 19,
                    name: hiddenBoardName,
                    spaceId: 1,
                    products: [],
                };
                BoardClient.getAllBoards = jest.fn(() => Promise.resolve({
                    data: [boardWithPrefix, ...TestUtils.boards],
                } as AxiosResponse));
            });

            it('should start with board one as current board', async () => {
                const app = renderWithRedux(<PeopleMover/>);
                await app.findByText('Product 1');
            });

        });
    });

    describe('products in the current board', () => {
        it('should only have corresponding products in productRefs', async () => {
            await act(async () => {
                const store = createStore(rootReducer, compose(applyMiddleware(thunk)));
                const component = <PeopleMover/>;
                renderWithRedux(component, store);

                const expectedProduct1Matcher = jasmine.objectContaining({
                    product: TestUtils.productWithAssignments,
                });
                const expectedProduct2Matcher = jasmine.objectContaining({
                    product: TestUtils.productWithoutAssignments,
                });

                await wait(() => {
                    expect(store.getState().productRefs.length).toEqual(2);
                });
                const productCardRefAndProductPairs = store.getState().productRefs;
                expect(productCardRefAndProductPairs).toContainEqual(expectedProduct1Matcher);
                expect(productCardRefAndProductPairs).toContainEqual(expectedProduct2Matcher);
            });
        });
    });
})
;