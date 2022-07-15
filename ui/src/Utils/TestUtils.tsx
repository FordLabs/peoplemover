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
import {MutableSnapshot, RecoilRoot, RecoilValue, useRecoilValue} from 'recoil';
import {render, RenderResult, waitFor} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import PeopleMover from '../PeopleMover/PeopleMover';
import DragAndDrop from '../DragAndDrop/DragAndDropContext';

async function renderPeopleMoverComponent(
    initializedRecoilState?: (mutableSnapshot: MutableSnapshot) => void,
    initialPath = '/uuid'
): Promise<RenderResult> {
    const result = renderWithRecoil(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/:teamUUID" element={<PeopleMover/>} />
            </Routes>
        </MemoryRouter>,
        initializedRecoilState
    );
    const uuid = initialPath.replace('/', '');
    await waitFor(() => expect(SpaceClient.getSpaceFromUuid).toHaveBeenCalledWith(uuid))
    return result;
}

export function renderWithRecoil(component: JSX.Element, initializeState?: (mutableSnapshot: MutableSnapshot) => void): RenderResult {
    return render(
        <RecoilRoot initializeState={initializeState}>
            <DragAndDrop>
                {component}
            </DragAndDrop>
        </RecoilRoot>
    )
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
    renderPeopleMoverComponent,
    RecoilObserver,
    createDataTestId,
    mockCreateRange,
    expectedCreateOptionText,
    hookWrapper
}

export default TestUtils;