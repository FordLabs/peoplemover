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

import React, {useState} from 'react';
import PurpleGradientBackgroundImage from 'Assets/background-left-purple-gradient.svg';
import Branding from 'Common/Branding/Branding';
import PeopleMoverLogo from 'Common/PeopleMoverLogo/PeopleMoverLogo';
import Input from 'Common/Input/Input';
import Textarea from 'Common/Textarea/Textarea';
import {UserType} from '../Types/ContactUsRequest';
import ContactUsClient from '../Services/Api/ContactUsClient';
import Header from '../Header/Header';

import './ContactUsPage.scss';

type TargetType = {
    email: { value: string };
    name: { value: string };
    userType: { value: string };
    message: { value: string };
}

function ContactUsPage() {
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    const getValue = (element: { value: string; }) => element.value;

    function onSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const target = event.currentTarget;
        const elements = target.elements as unknown as TargetType;

        ContactUsClient.send({
            email: getValue(elements.email),
            name: getValue(elements.name),
            userType: getValue(elements.userType) as UserType,
            message: getValue(elements.message),
        }).then(() => {
            target.reset();
            setIsSubmitted(true);
        });
    }

    return (
        <>
            <Header onlyShowSignOutButton />
            <div className="contact-us-page">
                <main className="main-content">
                    <h1 className="contact-us-page-title">Contact Us</h1>
                    <div className="right-content">
                        <PeopleMoverLogo/>
                        <h2>The People’s Feedback</h2>
                        <p>Getting started? Have questions? Let us know how we can help you with your PeopleMover space!</p>
                        <div className="required-text">All fields required.</div>
                        <form className="contact-us-page-form" onSubmit={onSubmit}>
                            <Input label="Name:" name="name" id="name" required />
                            <Input label="Email:" name="email" id="email" type="email" required />
                            <fieldset className="fieldset">
                                <legend>I am:</legend>
                                <Input
                                    label={UserType.NEW_USER} value={UserType.NEW_USER}
                                    id="new-user" type="radio" name="userType"
                                    required
                                />
                                <Input
                                    label={UserType.EXISTING_USER} value={UserType.EXISTING_USER}
                                    id="existing-user" type="radio" name="userType"
                                    required
                                />
                                <Input
                                    label={UserType.OTHER} value={UserType.OTHER}
                                    id="other-user" type="radio" name="userType"
                                    required
                                />
                            </fieldset>
                            <Textarea label="How can we help?" id="textarea" name="message" required />
                            {isSubmitted ? (
                                <div className="success-message">
                                    <p>Thanks! A member of our team will reach out to help you.</p>
                                    <a href="/user/dashboard">Back to Dashboard</a>
                                </div>
                            ) : (
                                <button className="contact-us-page-submit-button" type="submit">
                                Send
                                </button>
                            )}
                        </form>
                    </div>
                </main>
                <footer className="footer">
                    <Branding/>
                </footer>
                <img className="contact-us-background-image" src={PurpleGradientBackgroundImage} alt="" role="presentation"/>
            </div>
        </>
    )
}

export default ContactUsPage;