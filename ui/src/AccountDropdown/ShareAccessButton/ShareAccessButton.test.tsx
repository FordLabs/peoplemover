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

import React from 'react';
import {renderWithRecoil} from '../../Utils/TestUtils';
import ShareAccessButton from './ShareAccessButton';
import {screen, waitFor} from '@testing-library/react';
import {ModalContents, ModalContentsState} from '../../State/ModalContentsState';
import {RecoilObserver} from '../../Utils/RecoilObserver';
import {RunConfig} from '../../index';
import ShareAccessForm from '../ShareAccessForm/ShareAccessForm';

describe('Share Access Button', () => {
    const buttonText = 'Share Access';

    it('should open share access modal on click', async () => {
        let modalContents: ModalContents | null = null;
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

        renderWithRecoil(
            <>
                <RecoilObserver
                    recoilState={ModalContentsState}
                    onChange={(value: ModalContents) => {
                        modalContents = value;
                    }}
                />
                <ShareAccessButton />
            </>
        )

        expect(modalContents).toBeNull();
        screen.getByText(buttonText).click();

        await waitFor(() => expect(modalContents).toEqual({
            title: 'Share Access',
            component: <ShareAccessForm />,
            hideTitle: true,
            hideCloseBtn: true,
            hideBackground: true
        }));
    });

    it('should show button if runConfig.invite_users_to_space_enabled is set to true', () => {
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;
        renderWithRecoil(<ShareAccessButton />);
        expect(screen.getByText(buttonText)).toBeDefined();
    });

    it('should not show button if runConfig.invite_users_to_space_enabled is set to false', () => {
        window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;
        renderWithRecoil(<ShareAccessButton />);
        expect(screen.queryByText(buttonText)).toBeNull();
    });
});