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

import AnnouncementHeader, {PREVIOUS_BANNER_MESSAGE_KEY} from './AnnouncementBanner';
import React from 'react';

import {RenderResult, screen} from '@testing-library/react';
import {renderWithRecoil} from 'Utils/TestUtils';
import {FlagsState} from 'State/FlagsState';
import {Flag} from 'Types/Flag';

describe('announcement header', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should hide itself when you click close', () => {
        const flagMessage = 'This is a message!'
        renderAnnouncementBanner({
            announcementBannerMessage: flagMessage,
            announcementBannerEnabled: true,
        })

        expect(screen.getByText(flagMessage)).toBeInTheDocument();
        screen.getByText('close').click();
        expect(screen.queryByText(flagMessage)).not.toBeInTheDocument();
    });

    it('does not render if recoil returns default value', () => {
        renderWithRecoil(<AnnouncementHeader/>);
        expect(screen.queryByText('close')).not.toBeInTheDocument();
    });

    it('does not overwrite localstorage with default recoil state', () => {
        localStorage.setItem(PREVIOUS_BANNER_MESSAGE_KEY, 'hello i am a banner');
        renderWithRecoil(<AnnouncementHeader/>);

        expect(localStorage.getItem(PREVIOUS_BANNER_MESSAGE_KEY)).toEqual('hello i am a banner');
    });

    it('should not display if announcement banner enabled flag is disabled',  () => {
        const flagMessage = 'Heeeeyyy!'
        renderAnnouncementBanner({
            announcementBannerMessage: flagMessage,
            announcementBannerEnabled: false,
        })
        expect(screen.queryByText(flagMessage)).not.toBeInTheDocument();
    });


    it('should not display if banner has been closed by user and the message has not changed', () => {
        const flagMessage = 'hello i am a banner'
        const {unmount} =  renderAnnouncementBanner({
            announcementBannerMessage: flagMessage,
            announcementBannerEnabled: true,
        })

        expect(screen.queryByText(flagMessage)).toBeInTheDocument();
        screen.getByText('close').click();
        expect(screen.queryByText(flagMessage)).not.toBeInTheDocument();

        unmount()

        renderAnnouncementBanner({
            announcementBannerMessage: flagMessage,
            announcementBannerEnabled: true,
        })

        expect(screen.queryByText(flagMessage)).not.toBeInTheDocument();
    });

    it('should display if banner has been closed by user and the message has changed', () => {
        localStorage.setItem('previousBannerMessage', 'hello i am a banner');
        localStorage.setItem('bannerHasBeenClosedByUser', 'true');

        const flagMessage = 'hello i am a different banner'
        renderAnnouncementBanner({
            announcementBannerMessage: flagMessage,
            announcementBannerEnabled: true,
        })

        expect(screen.queryByText(flagMessage)).toBeInTheDocument();
    });
});

function renderAnnouncementBanner(flagState: Flag): RenderResult {
    return renderWithRecoil(
        <AnnouncementHeader/>,
        ({set}) => {
            set(FlagsState, flagState)
        }
    )
}
