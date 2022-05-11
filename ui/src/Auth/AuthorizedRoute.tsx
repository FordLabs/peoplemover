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

import {RouteProps} from 'react-router';
import React, {useEffect, useState} from 'react';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from '../Login/AccessTokenClient';
import {AxiosError} from 'axios';
import {setIsReadOnlyAction} from '../Redux/Actions';
import {connect} from 'react-redux';
import {useNavigate, useParams} from 'react-router-dom';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;

interface AuthorizedRouteProps extends RouteProps {
    setIsReadOnly(isReadOnly: boolean): boolean;
}

function AuthorizedRoute(props: AuthorizedRouteProps): JSX.Element {
    const {children, setIsReadOnly} = props;
    const { teamUUID = '' } = useParams<{ teamUUID: string }>()
    const [renderedElement, setRenderedElement] = useState<JSX.Element>(<></>);
    const navigate = useNavigate();

    useEffect(() => {
        setIsReadOnly(false);

        if (!window.runConfig.auth_enabled) {
            setRenderedElement(<>{children}</>);
        } else {
            const cookie = new Cookies();
            const accessToken = cookie.get('accessToken');

            AccessTokenClient.userCanAccessSpace(accessToken, teamUUID)
                .then(() => {
                    setRenderedElement(<>{children}</>)
                })
                .catch((error: AxiosError) => {
                    setIsReadOnly(true);
                    if (!error.response) return;
                    switch (error.response.status) {
                        case HTTP_FORBIDDEN: {
                            setRenderedElement(<>{children}</>);
                            break;
                        }
                        case HTTP_NOT_FOUND: {
                            navigate("/error/404");
                            break;
                        }
                        case HTTP_UNAUTHORIZED:
                        default: {
                            navigate("/user/login");
                        }
                    }
                });
        }
    }, [setIsReadOnly, teamUUID, children, navigate]);

    return <>{renderedElement}</>;
}

/* eslint-disable */
const mapDispatchToProps = (dispatch: any) => ({
    setIsReadOnly: (isReadOnly: boolean) => dispatch(setIsReadOnlyAction(isReadOnly)),
});

export default connect(null, mapDispatchToProps)(AuthorizedRoute);
/* eslint-enable */
