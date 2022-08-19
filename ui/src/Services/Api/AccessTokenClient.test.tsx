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
import Cookies from 'universal-cookie';
import AccessTokenClient from './AccessTokenClient';

describe('Access Token Client', function () {
    const cookies = new Cookies();
    const accessToken = '123456';
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn().mockResolvedValue({});
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should validate access token and return result', function (done) {
        const expectedUrl = '/api/access_token/validate';
        AccessTokenClient.validateAccessToken(accessToken).then(() => {
            expect(Axios.post).toHaveBeenCalledWith(
                expectedUrl,
                { accessToken },
                expectedConfig
            );
            done();
        });
    });

    it('should check user has access to space and return result', function (done) {
        const expectedUrl = '/api/access_token/authenticate';
        const spaceUUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
        AccessTokenClient.userCanAccessSpace(accessToken, spaceUUID).then(
            () => {
                expect(Axios.post).toHaveBeenCalledWith(
                    expectedUrl,
                    {
                        accessToken: accessToken,
                        uuid: spaceUUID,
                    },
                    expectedConfig
                );
                done();
            }
        );
    });
});
