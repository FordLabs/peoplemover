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

import Flagsmith from '../__mocks__/flagsmith';
import FlagSmithService from './FlagSmithService';

describe('Flag Smith Service', () => {
    it('should initialize flagsmith and return all flags', async () => {
        const flagSmithUrl = 'flagsmith-url';
        const flagsmithEnvironmentId = 'flagsmith-environment-id'
        const flags = await FlagSmithService.initAndGetFlags( flagSmithUrl, flagsmithEnvironmentId);
        expect(Flagsmith.init).toHaveBeenCalledWith({
            environmentID: flagsmithEnvironmentId,
            api: flagSmithUrl,
        });
        expect(flags).toEqual({ flags: true })
        expect(Flagsmith.getAllFlags).toHaveBeenCalled();
    });
});
