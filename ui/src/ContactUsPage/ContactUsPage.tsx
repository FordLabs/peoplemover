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
import PurpleGradientBackgroundImage from 'Assets/background-left-purple-gradient.svg';
import Branding from 'ReusableComponents/Branding';
import PeopleMoverLogo from 'ReusableComponents/PeopleMoverLogo';
import Input from 'ReusableComponents/Input/Input';
import Textarea from 'ReusableComponents/Textarea/Textarea';

import './ContactUsPage.scss';

function ContactUsPage() {

    function onSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        console.log('Send!');
    }

    return (
        <div className="contact-us-page">
            <main className="main-content">
                <h1 className="contact-us-page-title">Contact Us</h1>
                <div className="right-content">
                    <PeopleMoverLogo/>
                    <h2>The People’s Feedback</h2>
                    <p>Getting started? Have questions? Let us know how we can help you with your PeopleMover space!</p>
                    <form className="contact-us-page-form" onSubmit={onSubmit}>
                        <Input label="Name:" />
                        <Input label="Email:" />
                        <fieldset className="fieldset">
                            <legend>I am:</legend>
                            <div>
                                <Input label="New User" id="new-user" type="radio" name="user-type" />
                                <Input label="Existing User" id="existing-user" type="radio" name="user-type" />
                                <Input label="Other" id="other-user" type="radio" name="user-type" />
                            </div>
                        </fieldset>
                        <Textarea label="How can we help?" id="textarea" />
                        <button className="contact-us-page-submit-button">Send</button>
                    </form>
                </div>
            </main>
            <footer className="footer">
                <Branding/>
            </footer>
            <img className="contact-us-background-image" src={PurpleGradientBackgroundImage} alt="" role="presentation"/>
        </div>
    )
}

export default ContactUsPage;