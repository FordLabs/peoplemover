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

import {MatomoWindow} from '../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

const MatomoEvents = {
    pushEvent: function(category: string, action: string, name: string, value?: number): void {
        if (!window._paq) window._paq = [];
        const eventArray: Array<string | number> = ['trackEvent', category, action, name];
        if (value) eventArray.push(value);
        window._paq.push(eventArray);
    },
};

export default MatomoEvents;
