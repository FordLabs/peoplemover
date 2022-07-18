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

import './Styles/Colors.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import {RedirectToADFS} from './Auth/AuthenticatedRoute';
import Axios from 'axios';
import UnsupportedBrowserPage from './UnsupportedBrowserPage/UnsupportedBrowserPage';
import FocusRing from './FocusRing';
import MatomoEvents from './Matomo/MatomoEvents';
import CacheBuster from './CacheBuster';
import {removeToken} from './Auth/TokenProvider';
import Routes from './Routes';
import flagsmith, {IFlags} from 'flagsmith';

import axe from '@axe-core/react';
import {RecoilRoot} from 'recoil';
import {FlagsState, simplifyFlags} from './State/FlagsState';

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000);
}

declare global {
    interface Window {
        runConfig: RunConfig;
    }
}

export interface RunConfig {
    auth_enabled: boolean;
    ford_labs_url: string;
    invite_users_to_space_enabled: boolean;
    adfs_url_template: string;
    adfs_client_id: string;
    adfs_resource: string;
    flagsmith_environment_id: string;
    flagsmith_url: string;
}

window.addEventListener('keydown', FocusRing.turnOnWhenTabbing);

const UNAUTHORIZED = 401;
Axios.interceptors.response.use(
    response => response,
    error => {
        const {status, statusText, config} = error.response;

        if (status === UNAUTHORIZED) {
            removeToken();
            RedirectToADFS();
        } else {
            const conventionizedErrorName = `${statusText} - ${status}`;
            MatomoEvents.pushEvent(conventionizedErrorName, config.method, config.url, status);
        }
        return Promise.reject(error);
    },
);

let browserName = '';

/* eslint-disable */
function isUnsupportedBrowser(): boolean {
    // Safari 3.0+ "[object HTMLElementConstructor]"
    // @ts-ignore
    const isSafari = /constructor/i.test(window.HTMLElement) || (function(p): boolean {
        return p.toString() === '[object SafariRemoteNotification]';
    // @ts-ignore
    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
    if (isSafari) browserName = 'Safari';

    // Internet Explorer 6-11
    // @ts-ignore
    const isIE = /*@cc_on!@*/!!document.documentMode;
    if (isIE) browserName = 'Internet Explorer';

    // Edge 20+
    // @ts-ignore
    const isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) browserName = 'Edge';

    return isSafari || isIE || isEdge;
}
/* eslint-enable */

interface CacheBusterProps {
    loading: boolean;
    isLatestVersion: boolean;
    refreshCacheAndReload: Function;
}

if (isUnsupportedBrowser()) {
    ReactDOM.render(
        <UnsupportedBrowserPage browserName={browserName}/>,
        document.getElementById('root'),
    );
} else {
    Axios.get( '/api/config', {headers: {'Content-Type': 'application/json'}})
        .then(async (response) => {
            window.runConfig = Object.freeze(response.data);
            let flags: IFlags;

            flagsmith.init({
                environmentID : window.runConfig.flagsmith_environment_id,
                api: window.runConfig.flagsmith_url,
            }).then(() => { flags = flagsmith.getAllFlags() }, () => console.log('Flagsmith client failed to initialize'));

            ReactDOM.render(
                <CacheBuster>
                    {({loading, isLatestVersion, refreshCacheAndReload}: CacheBusterProps): JSX.Element | null => {
                        if (loading) return null;
                        if (!loading && !isLatestVersion) refreshCacheAndReload();

                        return (
                            <RecoilRoot initializeState={({set}) => {
                                set(FlagsState, simplifyFlags(flags))
                            }}>
                                <Routes />
                            </RecoilRoot>
                        );
                    }}
                </CacheBuster>,
                document.getElementById('root')
            );
        });
}
