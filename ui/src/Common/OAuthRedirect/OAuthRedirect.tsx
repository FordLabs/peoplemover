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

import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const OAUTH_REDIRECT_DEFAULT = '/user/dashboard';
const OAUTH_REDIRECT_SESSIONSTORAGE_KEY = 'oauth_redirect';

function OAuthRedirect(): JSX.Element {
    const searchParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = searchParams.get('access_token');
    const cookies = new Cookies();
    cookies.set('accessToken', accessToken, {path: '/'});

    const redirectUrl = getOauthRedirect();
    sessionStorage.removeItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY);

    return <Navigate to={redirectUrl}/>;
}

function getOauthRedirect(): string {
    const adfsSpaceRedirect = sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY);
    return (adfsSpaceRedirect ? adfsSpaceRedirect : OAUTH_REDIRECT_DEFAULT);
}

function setOauthRedirect(pathName: string): void {
    const oauthRedirectUnset = !sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY);
    const pathnameExists = pathName?.length > 1;
    if (
        oauthRedirectUnset
        && pathnameExists
    ) {
        sessionStorage.setItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY, pathName);
    }
}

export {OAuthRedirect, setOauthRedirect};
