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

import Axios, {AxiosResponse} from 'axios';
import {getAxiosConfig} from '../Utils/getAxiosConfig';

async function validateAccessToken(accessToken: string): Promise<AxiosResponse> {
    const url = '/api/access_token/validate';
    const data = { accessToken: accessToken };
    return Axios.post(url, data, getAxiosConfig());
}

async function userCanAccessSpace(accessToken: string, uuid: string): Promise<AxiosResponse> {
    const url = '/api/access_token/authenticate';
    const data = {
        accessToken: accessToken,
        uuid: uuid,
    };
    return Axios.post(url, data, getAxiosConfig());
}

const AccessTokenClient = {
    validateAccessToken,
    userCanAccessSpace
}

export default AccessTokenClient
