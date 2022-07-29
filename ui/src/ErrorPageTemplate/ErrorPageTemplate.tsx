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
import './ErrorPageTemplate.scss';
import Branding from '../Common/Branding/Branding';
import FormButton from '../ModalFormComponents/FormButton';

interface Props {
    errorGraphic: string;
    errorText: string;
}

function ErrorPageTemplate({errorGraphic, errorText}: Props): JSX.Element {
    return (
        <div className="ErrorPageContainer" data-testid="errorPageTemplate">
            <main className="ErrorImageAndTextContainer">
                <h1 className="oopsText">Oops!</h1>
                <img src={errorGraphic} alt="" className="errorGraphic"/>
                <div>
                    <h2 className="heading">{ errorText }</h2>
                </div>
                <a href="/user/dashboard">
                    <FormButton className="backToDashboardButton">
                        Back to Dashboard
                    </FormButton>
                </a>
            </main>
            <footer className="errorPageFooter">
                <Branding />
            </footer>
        </div>
    );
}
export default ErrorPageTemplate;
