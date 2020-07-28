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

import React, {ReactElement, useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {Redirect} from "react-router";

interface ValidationGuard {
    children: ReactElement;
}

function ValidationGuard({children}: ValidationGuard): JSX.Element {

    const [renderedElement, setRenderedElement] = useState<JSX.Element>(<></>);

    useEffect(() => {
        if (process.env.REACT_APP_AUTH_ENABLED === 'false') {
            setRenderedElement(children);
        } else {
            const cookie = new Cookies();
            const accessToken = cookie.get('accessToken');

            const spaceName = window.location.pathname.replace('/', '');

            AccessTokenClient.userCanAccessSpace(accessToken, spaceName)
                .then(() => setRenderedElement(children))
                .catch(() => setRenderedElement(<Redirect to={'/user/login'}/>));
        }
    }, []);

    return <>{renderedElement}</>;
}

export default ValidationGuard;
