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

import {Route, RouteProps} from "react-router";
import * as React from "react";

export function AuthenticatedRoute<T extends RouteProps>(props: T): JSX.Element {
    const {children, ...rest} = props;

    const accessToken = window.sessionStorage.getItem('accessToken');
    const isAuthenticated = accessToken !== null && accessToken !== 'null';

    return (
        <Route {...rest}>{isAuthenticated ? children : <RedirectToADFS/>}</Route>
    )
}

function RedirectToADFS(){
    let oauthUri: string = process.env.REACT_APP_ADFS_URL_TEMPLATE!!;
    const clientId: string = process.env.REACT_APP_ADFS_CLIENT_ID!!;
    const resource: string = process.env.REACT_APP_ADFS_RESOURCE!!;
    const redirectUri: string = `${window.location.origin}/oauth/redirect`!!;

    oauthUri = oauthUri.replace('%s', clientId);
    oauthUri = oauthUri.replace('%s', resource);
    oauthUri = oauthUri.replace('%s', redirectUri);

    window.location.href = oauthUri;

    return null;
}
