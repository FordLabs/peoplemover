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

import React from 'react';
import './Error404Page.scss';
import Header from './Header';
import AnimatedImageSrc from './Assets/404.gif';
import Branding from '../ReusableComponents/Branding';

function Error404Page(): JSX.Element {
    return (
        <div className="Error404PageContainer">
            <Header hideAllButtons={true}/>
            <div className="ErrorImageAndTextContainer">
                <h1 className="oopsText">Oops!</h1>
                <img src={AnimatedImageSrc} alt="" className="animatedImage"/>
                <div>
                    <div className="heading">It seems all your people have moved to another planet.</div>
                    <div className="sub-heading">You’ve hit a 404 error. We can’t seem to find the page you’re looking for, please double check your link.</div>
                </div>
            </div>

            <footer className="errorPageFooter">
                <Branding brand="FordLabs" message="Powered by"/>
            </footer>

        </div>
    );
}
export default Error404Page;
