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
import {OAuthRedirect} from './Auth/OAuthRedirect/OAuthRedirect';
import {AuthenticatedRoute} from './Auth/AuthenticatedRoute/AuthenticatedRoute';
import RedirectWrapper from './RedirectWrapper';
import DashboardPage from './DashboardPage/DashboardPage';
import AuthorizedRoute from './Auth/AuthorizedRoute/AuthorizedRoute';
import SpacePage from './SpacePage/SpacePage';
import TimeOnProduct from './TimeOnProductPage/TimeOnProduct';
import AnnouncementBanner from './AnnouncementBanner/AnnouncementBanner';
import ContactUsPage from './ContactUsPage/ContactUsPage';
import NotFoundErrorPage from './ErrorPages/NotFoundErrorPage';
import ForbiddenErrorPage from './ErrorPages/ForbiddenErrorPage';

export const contactUsPath = '/contact-us';
export const dashboardUrl = '/user/dashboard';
const NOT_FOUND = '404';
const FORBIDDEN = '403'
const notFoundUrl = `/error/${NOT_FOUND}`;

function Routes(): JSX.Element {
    return (
        <Router>
            <AnnouncementBanner/>
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
                        <DashboardPage/>
                    </AuthenticatedRoute>
                } />
                <Route path="/:teamUUID">
                    <Route path="" element={
                        <AuthorizedRoute>
                            <SpacePage/>
                        </AuthorizedRoute>
                    } />
                    <Route path="timeonproduct" element={
                        <AuthorizedRoute>
                            <TimeOnProduct/>
                        </AuthorizedRoute>
                    } />
                </Route>
                <Route path={contactUsPath} element={<ContactUsPage />} />
                <Route path="/error">
                    <Route path="" element={<Navigate to={NOT_FOUND} />} />
                    <Route path={NOT_FOUND} element={<NotFoundErrorPage />} />
                    <Route path={FORBIDDEN} element={<ForbiddenErrorPage />} />
                </Route>
                <Route element={<Navigate replace to={notFoundUrl} />} />
            </ReactRoutes>
        </Router>
    );
}

export default Routes;
