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
import CacheBuster, {CacheBusterProps} from './CacheBuster';
import {removeToken} from './Services/TokenService';
import Routes from './Routes';
import {IFlags} from 'flagsmith';

import axe from '@axe-core/react';
import {RecoilRoot} from 'recoil';
import {FlagsState, simplifyFlags} from './State/FlagsState';
import {getBrowserInfo} from './Utils/getBrowserInfo';
import FlagSmithService from './Services/FlagSmithService';
import reactDomRender from './Utils/reactDomRender';
import EnvironmentConfigService from './Services/Api/EnvironmentConfigService';

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000);
}

window.addEventListener('keydown', FocusRing.turnOnWhenTabbing);

const UNAUTHORIZED = 401;
Axios.interceptors.response.use(
    response => response,
    error => {
        const {status} = error.response;

        if (status === UNAUTHORIZED) {
            removeToken();
            RedirectToADFS();
        }
        return Promise.reject(error);
    },
);
const { isNotSupported, browserName } = getBrowserInfo()

if (isNotSupported) {
    reactDomRender(<UnsupportedBrowserPage browserName={browserName}/>);
} else {
    EnvironmentConfigService.get()
        .then(async (runConfig) => {
            const flags: IFlags | null = await FlagSmithService.initAndGetFlags(
                runConfig.flagsmith_url,
                runConfig.flagsmith_environment_id
            );

            reactDomRender(
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
                </CacheBuster>
            );
        });
}
