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

import axios from 'axios';
import EnvironmentConfigService from './EnvironmentConfigService';
import {RunConfig} from '../../Types/RunConfig';

describe('Environment Config Service', () => {
    it('should get and return run config and set runConfig in window', async () => {
        const expectedRunConfig: RunConfig = {
            auth_enabled: false,
            ford_labs_url: '',
            invite_users_to_space_enabled: true,
            adfs_url_template: 'adfs_url_template',
            adfs_client_id: 'adfs_client_id',
            adfs_resource: 'adfs_resource',
            flagsmith_environment_id: 'flagsmith_environment_id',
            flagsmith_url: 'flagsmith_url',
        }
        axios.get = jest.fn().mockResolvedValue({ data: expectedRunConfig });
        expect(window.runConfig).toBeUndefined();

        const actualRunConfig = await EnvironmentConfigService.get();

        expect(actualRunConfig).toEqual(expectedRunConfig);
        expect(window.runConfig).toEqual(expectedRunConfig);
        expect(axios.get).toHaveBeenCalledWith('/api/config', {headers: {'Content-Type': 'application/json'}})
    });
});