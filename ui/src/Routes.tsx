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

import React from 'react';
import {BrowserRouter as Router, Navigate, Route, Routes as ReactRoutes} from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import {OAuthRedirect} from './Common/OAuthRedirect/OAuthRedirect';
import {AuthenticatedRoute} from './Auth/AuthenticatedRoute';
import RedirectWrapper from './RedirectWrapper';
import SpaceDashboard from './SpaceDashboard/SpaceDashboard';
import AuthorizedRoute from './Auth/AuthorizedRoute';
import PeopleMover from './PeopleMover/PeopleMover';
import ErrorPageTemplate from './ErrorPageTemplate/ErrorPageTemplate';
import TimeOnProduct from './TimeOnProductPage/TimeOnProduct';
import AnimatedImageSrc from './Assets/404.gif';
import errorImageSrc from './Assets/403.png';
import Header from './Header/Header';
import AnnouncementBanner from './AnnouncementBanner/AnnouncementBanner';
import ContactUsPage from './ContactUsPage/ContactUsPage';

export const contactUsPath = '/contact-us';
export const dashboardUrl = '/user/dashboard';
const notFoundUrl = '/error/404';
const forbiddenUrl = '/error/403';

function Routes(): JSX.Element {
    return (
        <Router>
            <AnnouncementBanner/>
            <Header/>
            <ReactRoutes>
                <Route path="/" element={<LandingPage/>} />
                <Route path="/adfs/catch" element={<OAuthRedirect/>} />
                <Route path="/user/login" element={
                    <AuthenticatedRoute>
                        <RedirectWrapper redirectUrl={dashboardUrl}/>
                    </AuthenticatedRoute>
                } />
                <Route path={dashboardUrl} element={
                    <AuthenticatedRoute>
                        <SpaceDashboard/>
                    </AuthenticatedRoute>
                } />
                <Route path="/:teamUUID" element={
                    <AuthorizedRoute>
                        <PeopleMover/>
                    </AuthorizedRoute>
                } />
                <Route path="/:teamUUID/timeonproduct" element={
                    <AuthorizedRoute>
                        <TimeOnProduct/>
                    </AuthorizedRoute>
                } />
                <Route path={contactUsPath} element={<ContactUsPage />} />
                <Route
                    path={notFoundUrl}
                    element={
                        <ErrorPageTemplate
                            errorGraphic={AnimatedImageSrc}
                            errorText="We can&apos;t seem to find the page you&apos;re looking for. Please double check your link."
                        />
                    }
                />
                <Route
                    path={forbiddenUrl}
                    element={
                        <ErrorPageTemplate
                            errorGraphic={errorImageSrc}
                            errorText="You don&apos;t have access to this page. Please request access."
                        />
                    }
                />
                <Route element={<Navigate replace to={notFoundUrl} />} />
            </ReactRoutes>
        </Router>
    );
}

export default Routes;
