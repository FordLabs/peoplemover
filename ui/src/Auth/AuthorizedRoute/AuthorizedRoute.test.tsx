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

import { screen, waitFor } from '@testing-library/react';
import AuthorizedRoute from './AuthorizedRoute';
import React from 'react';
import Axios from 'axios';
import { RunConfig } from 'Types/RunConfig';
import { renderWithRecoil } from 'Utils/TestUtils';
import { MemoryRouter } from 'react-router-dom';
import { IsReadOnlyState } from 'State/IsReadOnlyState';
import { RecoilObserver } from 'Utils/RecoilObserver';

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

describe('Authorized Route', () => {
    let isReadOnly = false;

    it('should redirect to login when security is enabled and you are not authenticated', async () => {
        window.runConfig = { auth_enabled: true } as RunConfig;
        Axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
        await renderComponent(true);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/user/login');
    });

    it('should show the child element when security is enabled and you are authenticated and authorized', async () => {
        window.runConfig = { auth_enabled: true } as RunConfig;
        Axios.post = jest.fn().mockResolvedValue({});
        await renderComponent(true);
        expect(screen.getByText('I am so secure!')).toBeInTheDocument();
        expect(isReadOnly).toBeFalsy();
    });

    it('should show the child element when security is enabled and you are authenticated but not authorized (read only)', async () => {
        Axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
        await renderComponent(true);
        expect(screen.getByText('I am so secure!')).toBeInTheDocument();
        expect(isReadOnly).toBeTruthy();
    });

    it('should show 404 page when security is enabled and space uuid does not exist', async () => {
        Axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
        await renderComponent(true);
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/error/404');
        expect(isReadOnly).toBeTruthy();
    });

    it('should show the child element when security is disabled', async () => {
        Axios.post = jest.fn().mockRejectedValue({});
        await renderComponent(false);
        expect(screen.getByText('I am so secure!')).toBeInTheDocument();
        expect(isReadOnly).toBeFalsy();
        expect(Axios.post).toHaveBeenCalledTimes(0);
    });

    async function renderComponent(
        securityEnabled: boolean,
        isReadOnlyDefaultState = false
    ): Promise<void> {
        window.runConfig = { auth_enabled: securityEnabled } as RunConfig;

        await waitFor(() => {
            renderWithRecoil(
                <MemoryRouter initialEntries={['/user/dashboard']}>
                    <AuthorizedRoute>
                        <RecoilObserver
                            recoilState={IsReadOnlyState}
                            onChange={(value: boolean) => {
                                isReadOnly = value;
                            }}
                        />
                        <TestComponent />
                    </AuthorizedRoute>
                </MemoryRouter>,
                ({ set }) => {
                    set(IsReadOnlyState, isReadOnlyDefaultState);
                }
            );
        });
    }

    function TestComponent(): JSX.Element {
        return <>I am so secure!</>;
    }
});
