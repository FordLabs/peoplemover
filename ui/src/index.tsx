/*
 * Copyright (c) 2020 Ford Motor Company
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

import './Application/Styleguide/Colors.scss';

import * as React from 'react';
import ReactDOM from 'react-dom';
import axe from 'react-axe';
import PeopleMover from './Application/PeopleMover';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore, StoreEnhancer} from 'redux';
import rootReducer from './Redux/Reducers';
import thunk from 'redux-thunk';
import {Route, Switch} from 'react-router';
import {BrowserRouter as Router, Redirect} from 'react-router-dom';
import Error404Page from './Application/Error404Page';
import LandingPage from './LandingPage/LandingPage';
import SpaceDashboard from './SpaceDashboard/SpaceDashboard';
import AuthorizedRoute from './Auth/AuthorizedRoute';
import OAuthRedirect from './ReusableComponents/OAuthRedirect';
import {AuthenticatedRoute, RedirectToADFS} from './Auth/AuthenticatedRoute';
import RedirectWrapper from './ReusableComponents/RedirectWrapper';
import Axios from 'axios';
import UnsupportedBrowserPage from './UnsupportedBrowserPage/UnsupportedBrowserPage';
import FocusRing from './FocusRing';
import MatomoEvents from './Matomo/MatomoEvents';
import CacheBuster from './CacheBuster';
import {removeToken} from './Auth/TokenProvider';

let reduxDevToolsExtension: Function | undefined = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
let reduxDevToolsEnhancer: Function | undefined;
if (reduxDevToolsExtension) {
    reduxDevToolsEnhancer = (window as any).__REDUX_DEVTOOLS_EXTENSION__();
}

let composedEnhancers: StoreEnhancer;
if (reduxDevToolsEnhancer) {
    composedEnhancers = compose(
        applyMiddleware(thunk),
        reduxDevToolsEnhancer,
    );
} else {
    composedEnhancers = compose(
        applyMiddleware(thunk)
    );
}

if (process.env.NODE_ENV !== 'production') {
    axe(React, ReactDOM, 1000);
}

const store = createStore(
    rootReducer,
    composedEnhancers,
);

declare global {
    interface Window {
        runConfig: RunConfig;
    }
}

export interface RunConfig {
    auth_enabled: boolean;
    invite_users_to_space_enabled: boolean;
    adfs_url_template: string;
    adfs_client_id: string;
    adfs_resource: string;
}

window.addEventListener('keydown', FocusRing.turnOnWhenTabbing);

const UNAUTHORIZED = 401;
Axios.interceptors.response.use(
    response => response,
    error => {
        const {status, statusText, config} = error.response;

        MatomoEvents.pushEvent(statusText, config.method, config.url, status);

        if (status === UNAUTHORIZED) {
            removeToken();
            RedirectToADFS();
        }
        return Promise.reject(error);
    }
);

function isUnsupportedBrowser(): boolean {
    // Safari 3.0+ "[object HTMLElementConstructor]"
    // @ts-ignore
    // eslint-disable-next-line no-undef
    var isSafari = /constructor/i.test(window.HTMLElement) || (function(p): boolean {
        return p.toString() === '[object SafariRemoteNotification]';
    })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Internet Explorer 6-11
    // @ts-ignore
    var isIE = /*@cc_on!@*/!!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    return isSafari || isIE || isEdge;
}

if (isUnsupportedBrowser()) {
    ReactDOM.render(<UnsupportedBrowserPage/>, document.getElementById('root'));
} else {
    Axios.get(`/api/config`,
        {headers: {'Content-Type': 'application/json'}}
    ).then((response) => {

        window.runConfig = Object.freeze(response.data);


        ReactDOM.render(<CacheBuster>
            {({loading, isLatestVersion, refreshCacheAndReload}) => {
                if (loading) return null;
                if (!loading && !isLatestVersion) {
                    // You can decide how and when you want to force reload
                    refreshCacheAndReload();
                }

                return (
                    <Provider store={store}>
                        <Router>
                            <Switch>

                                <Route exact path="/">
                                    <LandingPage/>
                                </Route>

                                <Route exact path="/adfs/catch">
                                    <OAuthRedirect redirectUrl="/user/dashboard"/>
                                </Route>

                                <AuthenticatedRoute exact path="/user/login">
                                    <RedirectWrapper redirectUrl="/user/dashboard"/>
                                </AuthenticatedRoute>

                                <AuthenticatedRoute exact path="/user/dashboard">
                                    <SpaceDashboard/>
                                </AuthenticatedRoute>

                                <AuthorizedRoute exact path="/:teamName">
                                    <PeopleMover/>
                                </AuthorizedRoute>

                                <Route path="/error/404">
                                    <Error404Page/>
                                </Route>

                                <Route>
                                    <Redirect to="/error/404"/>
                                </Route>
                            </Switch>
                        </Router>
                    </Provider>);
            }}
        </CacheBuster>,
        document.getElementById('root')
        );
    });
}
