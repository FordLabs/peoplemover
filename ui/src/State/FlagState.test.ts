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

import { simplifyFlags } from './FlagsState';
import { Flag } from '../Types/Flag';
import { IFlags } from 'flagsmith';

describe('Flag State', () => {
    describe('simplifyFlags', () => {
        it('turns IFlags into Flags', () => {
            const iFlag: IFlags = {
                announcement_banner_message: {
                    value: 'hello i am a banner',
                    enabled: false,
                },
                announcement_banner_enabled: {
                    enabled: true,
                },
            };

            expect(simplifyFlags(iFlag)).toEqual({
                announcementBannerMessage: 'hello i am a banner',
                announcementBannerEnabled: true,
            } as Flag);
        });

        it('return default flag if no flag was passed in', () => {
            expect(simplifyFlags()).toEqual({
                announcementBannerEnabled: false,
                announcementBannerMessage: 'default_banner_message',
            } as Flag);
        });
    });
});
