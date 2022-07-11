/*
 * Copyright (c) 2022 Ford Motor Company
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

import React, {ReactNode, useEffect} from 'react';
import SpaceClient from '../Space/SpaceClient';
import AssignmentClient from '../Assignments/AssignmentClient';
import ColorClient from '../Roles/ColorClient';
import {applyMiddleware, createStore, PreloadedState, Store} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import {MutableSnapshot, RecoilRoot, RecoilValue, useRecoilValue} from 'recoil';
import {render, RenderResult, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import PeopleMover from '../PeopleMover/PeopleMover';
import thunk from 'redux-thunk';
import {Provider} from 'react-redux';
import TestData from '../Utils/TestData';

// @todo replace this with jest manual mocks
function mockClientCalls(): void {
    AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({ data: [TestData.assignmentForPerson1] });
    AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [{...TestData.assignmentForPerson1}] });
    AssignmentClient.getAssignmentEffectiveDates = jest.fn().mockResolvedValue({
        data: [
            new Date(2020, 4, 15),
            new Date(2020, 5, 1),
            new Date(2020, 6, 1),
        ],
    });
    AssignmentClient.getReassignments = jest.fn().mockResolvedValue({ data: [] });
    AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({ data: [] });

    ColorClient.getAllColors = jest.fn().mockResolvedValue({ data: TestData.colors });
}

export function renderWithRedux(
    component: JSX.Element,
    store?: Store,
    initialState?: PreloadedState<Partial<GlobalStateProps>>,
): RenderResult {
    const testingStore: Store = store ? store : createStore(rootReducer, initialState, applyMiddleware(thunk));
    return render(<Provider store={testingStore}>{component}</Provider>);
}

async function renderPeopleMoverComponent(
    store?: Store,
    initialReduxState?: PreloadedState<Partial<GlobalStateProps>>,
    initializedRecoilState?: (mutableSnapshot: MutableSnapshot) => void,
    initialPath = '/uuid'
): Promise<RenderResult> {
    const result = renderWithRedux(
        <MemoryRouter initialEntries={[initialPath]}>
            <RecoilRoot initializeState={initializedRecoilState}>
                <Routes>
                    <Route path="/:teamUUID" element={<PeopleMover/>} />
                </Routes>
            </RecoilRoot>
        </MemoryRouter>,
        store,
        initialReduxState
    );
    const uuid = initialPath.replace('/', '');
    await waitFor(() => expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalledWith(uuid))
    return result;
}

export function renderWithRecoil(component: JSX.Element, initializeState?: (mutableSnapshot: MutableSnapshot) => void): RenderResult {
    return render(<RecoilRoot initializeState={initializeState}>{component}</RecoilRoot>)
}

const hookWrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
        <RecoilRoot>
            {children}
        </RecoilRoot>
    </MemoryRouter>
);

export function createDataTestId(prefix: string, name: string): string {
    return prefix + '__' + name.toLowerCase().replace(/ /g, '_');
}

export function mockCreateRange(): () => void {
    if (window.document) {
        const _createRange = window.document.createRange;

        window.document.createRange = function createRange(): Range {
            return {
                setEnd: () => null,
                setStart: () => null,
                getBoundingClientRect: (): DOMRect => {
                    return {right: 0} as DOMRect;
                },
                commonAncestorContainer: document.createElement('div'),
            } as unknown as Range;
        };

        return (): void => {
            window.document.createRange = _createRange;
        };
    } else {
        return (): void => {
            return;
        };
    }
}

function expectedCreateOptionText(expectedCreationString: string): string {
    return `Create "${expectedCreationString}"`;
}

export const RecoilObserver = ({
    recoilState,
    onChange,
}: {
    recoilState: RecoilValue<unknown>;
    onChange: Function;
}) => {
    const value = useRecoilValue(recoilState);
    useEffect(() => onChange(value), [onChange, value]);
    return null;
};

const TestUtils = {
    mockClientCalls,
    renderPeopleMoverComponent,
    RecoilObserver,
    createDataTestId,
    mockCreateRange,
    expectedCreateOptionText,
    hookWrapper
}

export default TestUtils;