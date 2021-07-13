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

import {Redirect, Route, RouteProps} from 'react-router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {AxiosError} from 'axios';
import {setIsReadOnlyAction} from '../Redux/Actions';
import {connect} from 'react-redux';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;

interface AuthorizedRouteProps extends RouteProps {
    setIsReadOnly(isReadOnly: boolean): boolean;
}

function AuthorizedRoute<T extends RouteProps>(props: AuthorizedRouteProps): JSX.Element {
    const {children, setIsReadOnly, ...rest} = props;
    const [renderedElement, setRenderedElement] = useState<JSX.Element>(<></>);

    function extractUuidFromUrl(): string {
        return window.location.pathname.split('/')[1];
    }

    /* eslint-disable */
    useEffect(() => {
        setIsReadOnly(false);

        if (!window.runConfig.auth_enabled) {
            setRenderedElement(<>{children}</>);
        } else {
            const cookie = new Cookies();
            const accessToken = cookie.get('accessToken');

            const uuid = extractUuidFromUrl();

            AccessTokenClient.userCanAccessSpace(accessToken, uuid)
                .then(() => {
                    setRenderedElement(<Route {...rest}>{children}</Route>);
                })
                .catch((error: AxiosError) => {
                    setIsReadOnly(true);
                    if (!error.response) return;
                    switch (error.response.status) {
                        case HTTP_FORBIDDEN: {
                            setRenderedElement(<Route {...rest}>{children}</Route>);
                            break;
                        }
                        case HTTP_NOT_FOUND: {
                            setRenderedElement(<Redirect to="/error/404"/>);
                            break;
                        }
                        case HTTP_UNAUTHORIZED:
                        default: {
                            setRenderedElement(<Redirect to="/user/login"/>);
                        }
                    }
                });
        }
    }, [children, setIsReadOnly, rest.path]);
    /* eslint-enable */

    return <>{renderedElement}</>;
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    setIsReadOnly: (isReadOnly: boolean) => dispatch(setIsReadOnlyAction(isReadOnly)),
});

export default connect(null, mapDispatchToProps)(AuthorizedRoute);
/* eslint-enable */
