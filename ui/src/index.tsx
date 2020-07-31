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

import './Application/Styleguide/Colors.scss';

import * as React from 'react';
import ReactDOM from 'react-dom';
import PeopleMover from './Application/PeopleMover';
import '@fortawesome/fontawesome-free/css/all.css';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore, StoreEnhancer} from 'redux';
import rootReducer from './Redux/Reducers';
import thunk from 'redux-thunk';
import {Route, Switch} from 'react-router';
import {BrowserRouter as Router, Redirect} from 'react-router-dom';
import Error404Page from './Application/Error404Page';
import LandingPage from './LandingPage/LandingPage';
import SpaceDashboard from './SpaceDashboard/SpaceDashboard';
import ValidationGuard from './Validation/ValidationGuard';
import OAuthRedirect from "./ReusableComponents/OAuthRedirect";
import {AuthenticatedRoute} from "./AuthenticatedRoute";

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

const store = createStore(
    rootReducer,
    composedEnhancers,
);
ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Switch>

                <Route exact path="/">
                    <LandingPage/>
                </Route>

                <Route exact path={"/adfs/catch"}>
                    <OAuthRedirect redirectUrl={"/user/dashboard"}/>
                </Route>

                <AuthenticatedRoute exact path={"/user/login"}>
                    <Redirect to={"/user/dashboard"}/>
                </AuthenticatedRoute>

                <Route exact path="/user/dashboard">
                    <SpaceDashboard/>
                </Route>

                <Route exact path="/:teamName">
                    <ValidationGuard>
                        <PeopleMover/>
                    </ValidationGuard>
                </Route>

                <Route path="/error/404">
                    <Error404Page/>
                </Route>

                <Route>
                    <Redirect to={`/error/404`} />
                </Route>
            </Switch>
        </Router>
    </Provider>,
    document.getElementById('root')
);
