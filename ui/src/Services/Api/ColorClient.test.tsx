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
import Axios from 'axios';
import ColorClient from './ColorClient';
import Cookies from 'universal-cookie';

describe('Color Client', () => {
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer 123456',
        },
    };
    const cookies = new Cookies();

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.get = jest.fn().mockResolvedValue({
            data: 'Get Products',
        });
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should retrieve colors', async () => {
        await ColorClient.getAllColors();
        const expectedUrl = '/api/color';
        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
    });
});
