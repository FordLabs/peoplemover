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

import React from 'react';
import LandingPageImage from './LandingPageImage.svg';
import LandingPageBackground from './LandingPageBackground.svg';
import FormButton from '../ModalFormComponents/FormButton';
import PeopleMoverLogo from '../ReusableComponents/PeopleMoverLogo';

import './LandingPage.scss';

function LandingPage(): JSX.Element {
    const LoginButton = () => (
        <a href="/user/login">
            <FormButton>
                Login
            </FormButton>
        </a>
    );

    return (
        <>
            <div className="landingPageContainer">
                <div className="landingPageInfoContainer">
                    <PeopleMoverLogo />
                    <div className="landingPageInfoHeading">It’s about the PEOPLE. Your PEOPLE.</div>
                    <div className="landingPageInfoSubHeading">And helping them be EXTRA EXTRA ORDINARY.</div>
                    <div className="landingPageInfoText">
                        Most allocation applications focus solely on projects and schedules, and seem 
                        to forget that a product is only as successful as its team. PeopleMover focuses on the people, 
                        helping you create and fluidly maintain balanced teams well suited for the product at hand – 
                        because we understand that a great team sets the stage for incredible results.
                    </div>
                    <div className="landingPageInfoSubHeading">Give it a shot!</div>
                    <div className="landingPageInfoText">Login with your CDSID to create your own PeopleMover&nbsp;space.</div>
                    <LoginButton />
                </div>
                <img className="landingPageImage"
                    src={LandingPageImage}
                    alt=""/>
            </div>
            <img className="landingPageBackground" src={LandingPageBackground} alt=""/>
        </>
    );
}
export default LandingPage;
