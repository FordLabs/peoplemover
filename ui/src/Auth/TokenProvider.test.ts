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
import {getUserNameFromAccessToken} from './TokenProvider';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

jest.mock('jwt-decode');

describe('TokenProvider', function() {
    let originalWindow: MatomoWindow;

    beforeEach(() => {
        originalWindow = window;
    });

    afterEach(() => {
        window = originalWindow;
    });

    describe('getUserNameFromAccessToken', function() {
        it('should get username from access token', function() {
            expect(getUserNameFromAccessToken()).toBe('USER_ID');
        });

        it('should set the username for matomo on _paq', async () => {
            getUserNameFromAccessToken();
            expect(window._paq).toContainEqual(['setUserId', 'USER_ID']);
        });
        it('should set track page views on _paq', function() {
            getUserNameFromAccessToken();
            expect(window._paq).toContainEqual(['trackPageView']);
        });
    });
});
