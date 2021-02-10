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
import {Redirect} from 'react-router';
import Cookies from 'universal-cookie';

const OAUTH_REDIRECT_DEFAULT = '/user/dashboard';
const OAUTH_REDIRECT_SESSIONSTORAGE_KEY = 'oauth_redirect';

function OAuthRedirect(): JSX.Element {
    const searchParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const accessToken = searchParams.get('access_token');
    const cookies = new Cookies();
    const adfsSpaceRedirect = sessionStorage.getItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY);
    const redirectUrl = (adfsSpaceRedirect ? adfsSpaceRedirect : OAUTH_REDIRECT_DEFAULT);
    sessionStorage.removeItem(OAUTH_REDIRECT_SESSIONSTORAGE_KEY);
    cookies.set('accessToken', accessToken, {path: '/'});

    return (<Redirect to={redirectUrl}/>);
}

export {OAuthRedirect, OAUTH_REDIRECT_DEFAULT, OAUTH_REDIRECT_SESSIONSTORAGE_KEY};
