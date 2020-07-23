/*
 * Copyright (c) 2019 Ford Motor Company
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

import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import { Redirect } from 'react-router-dom';
import {AccessTokenResponse} from '../Login/AccessTokenResponse';


interface Props {
    isSignup: boolean;
}

function RedirectAuthPage({isSignup}: Props): JSX.Element {

    const [redirectPage, setRedirectPage] = useState<JSX.Element>(<></>);

    function redirectToLoginPage(): void {
        window.sessionStorage.removeItem('accessToken');

        const redirectUri = encodeURIComponent(window.location.href);
        const authquestClientID = encodeURIComponent(process.env.REACT_APP_AUTHQUEST_CLIENT_ID as string);

        const startingPage = isSignup ? 'signup' : 'login';

        window.location.href = `${process.env.REACT_APP_AUTHQUEST_URL}/${startingPage}?redirect_uri=${redirectUri}&client_id=${authquestClientID}`;
    }

    function userVisitsPageWithTokenFlow(accessToken: string): void {
        AccessTokenClient.validateAccessToken(accessToken)
            .then(() => {

                AccessTokenClient.refreshAccessToken(accessToken).then((response) => {
                    const refreshToken: AccessTokenResponse = response.data;
                    window.sessionStorage.setItem('accessToken', refreshToken.access_token);

                    setRedirectPage(<Redirect to={'/user/dashboard'}/>);
                }).catch((err) => {
                    console.log('ERROR', err);
                });
            })
            .catch(redirectToLoginPage);
    }

    function userVisitsPageWithNoTokenFlow(): void {
        const cookies = new Cookies();

        const searchParams = new URL(window.location.href).searchParams;
        const accessCode = searchParams.get('access_code');


        if (!accessCode) {
            redirectToLoginPage();
        } else {
            AccessTokenClient.postAccessToken(accessCode).then(response => {
                const accessTokenResponse: AccessTokenResponse = response.data;
                const accessToken = accessTokenResponse.access_token;

                window.sessionStorage.setItem('accessToken', accessToken);

                setRedirectPage(<Redirect to={'/user/dashboard'}/>);
            }).catch(err => {
                console.log(err);
            });
        }
    }

    useEffect(() => {
        const accessToken = window.sessionStorage.getItem('accessToken');

        if (accessToken) {
            userVisitsPageWithTokenFlow(accessToken);
        } else {
            userVisitsPageWithNoTokenFlow();
        }

    }, []);

    return <>
        {redirectPage}
    </>;
}

export default RedirectAuthPage;
