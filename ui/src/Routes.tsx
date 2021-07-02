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
import {BrowserRouter as Router, Redirect} from 'react-router-dom';
import {Route, Switch} from 'react-router';
import LandingPage from './LandingPage/LandingPage';
import {OAuthRedirect} from './ReusableComponents/OAuthRedirect';
import {AuthenticatedRoute} from './Auth/AuthenticatedRoute';
import RedirectWrapper from './ReusableComponents/RedirectWrapper';
import SpaceDashboard from './SpaceDashboard/SpaceDashboard';
import AuthorizedRoute from './Auth/AuthorizedRoute';
import PeopleMover from './Application/PeopleMover';
import ErrorPageTemplate from './Application/ErrorPageTemplate';
import TimeOnProduct from './TimeOnProductPage/TimeOnProduct';
import AnimatedImageSrc from './Application/Assets/404.gif';
import errorImageSrc from './Application/Assets/403.png';
import Header from './Header/Header';
import AnnouncementBanner from './Header/AnnouncementBanner';

export const dashboardUrl = '/user/dashboard';
const notFoundUrl = '/error/404';
const forbiddenUrl = '/error/403';

function Routes(): JSX.Element {
    return (
        <Router>
            <AnnouncementBanner/>
            <Header/>
            <Switch>
                <Route exact path="/">
                    <LandingPage/>
                </Route>

                <Route exact path="/adfs/catch">
                    <OAuthRedirect/>
                </Route>

                <AuthenticatedRoute exact path="/user/login">
                    <RedirectWrapper redirectUrl={dashboardUrl}/>
                </AuthenticatedRoute>

                <AuthenticatedRoute exact path={dashboardUrl}>
                    <SpaceDashboard/>
                </AuthenticatedRoute>

                <AuthorizedRoute exact path="/:teamName">
                    <PeopleMover/>
                </AuthorizedRoute>

                <AuthorizedRoute exact path="/:teamName/timeonproduct">
                    <TimeOnProduct/>
                </AuthorizedRoute>

                <Route path={notFoundUrl}>
                    <ErrorPageTemplate errorGraphic={AnimatedImageSrc} errorText="We can&apos;t seem to find the page you&apos;re looking for. Please double check your link."/>
                </Route>

                <Route path={forbiddenUrl}>
                    <ErrorPageTemplate errorGraphic={errorImageSrc} errorText="You don&apos;t have access to this page. Please request access."/>
                </Route>

                <Route>
                    <Redirect to={notFoundUrl}/>
                </Route>
            </Switch>
        </Router>
    );
}

export default Routes;
