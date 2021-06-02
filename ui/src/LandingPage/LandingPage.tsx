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
import LandingPageImage from './LandingPageImage.svg';
import LandingPageBackground from './LandingPageBackground.svg';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';
import Branding from '../ReusableComponents/Branding';

import './LandingPage.scss';
import AnnouncementBanner from '../Header/AnnouncementBanner';

function LandingPage(): JSX.Element {
    const LoginButton = (): JSX.Element => (
        <a href="/user/login" className="primaryButton getStartedButton">
            Get Started
        </a>
    );

    return (
        <>
            <main className="mainContainer"  data-testid="landingPage">
                <AnnouncementBanner/>
                <div className="landingPageContainer">
                    <div className="landingPageInfoContainer">
                        <PeopleMoverLogo/>
                        <h1 className="landingPageInfoHeading">It’s about the people. Your people.</h1>
                        <h2 className="landingPageInfoSubHeading">And helping them be extraordinary.</h2>
                        <p className="landingPageInfoText">
                        Most allocation applications focus solely on projects and schedules, and seem
                        to forget that a product is only as successful as its team. PeopleMover focuses on the people,
                        helping you create and fluidly maintain balanced teams well suited for the product at hand –
                        because we understand that a great team sets the stage for incredible results.
                        </p>
                        <LoginButton/>
                    </div>
                    <div className="landingPageImageContainer">
                        <img className="landingPageImage"
                            src={LandingPageImage}
                            alt="Preview of People Mover Space after logging in"/>
                        <Branding />
                    </div>
                </div>
            </main>
            <img className="landingPageBackground" src={LandingPageBackground} alt="" role="presentation"/>
        </>
    );
}

export default LandingPage;
