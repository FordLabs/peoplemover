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

import {atom} from 'recoil';
import {IFlags} from 'flagsmith';
import {Flag} from '../Types/Flag';

export const DEFAULT_BANNER_MESSAGE = 'default_banner_message';

const DEFAULT_FLAGS_STATE: Flag = {
    announcementBannerEnabled: false,
    announcementBannerMessage: DEFAULT_BANNER_MESSAGE
}

export const FlagsState = atom<Flag>({
    key: 'FlagsState',
    default: DEFAULT_FLAGS_STATE,
});

export const simplifyFlags = (flags?: IFlags): Flag => {
    return flags ? {
        announcementBannerEnabled: flags['announcement_banner_enabled'].enabled,
        announcementBannerMessage: flags['announcement_banner_message'].value ? flags['announcement_banner_message'].value : '',
    } : DEFAULT_FLAGS_STATE;
};