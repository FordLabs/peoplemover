/*
 * Copyright (c) 2021 Ford Motor Company
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

import Cookies from 'universal-cookie';
import jwtDecoder from 'jwt-decode';
import MatomoService from './MatomoService';

export const getToken = (): string => {
    const cookies = new Cookies();
    return cookies.get('accessToken');
};

export const removeToken = (): void => {
    const cookie = new Cookies();
    cookie.remove('accessToken', {path: '/'});
};

export const getDecodedToken = (): { sub: string; } | null => {
    const accessToken = getToken();
    return jwtDecoder(accessToken);
};

export const getUserNameFromAccessToken = (): string => {
    try {
        const decodedAccessToken = getDecodedToken();
        const userName = decodedAccessToken?.sub || '';
        MatomoService.addUserToMatomo(userName);

        return userName;
    } catch {
        return '';
    }
};
