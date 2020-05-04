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
import './Branding.scss';

interface BrandingProps{
    message: string;
    brand: string;
}

function Branding({
    message,
    brand,
}: BrandingProps): JSX.Element {

    return (<div className={'branding-container'}>
        <p className={'branding-message'}>{message}</p>
        <img className={'branding-image'}
            src={require('../Application/Assets/fordlabs_logo.svg')}
            alt={message}
            width="20"
            height="20"/>
        <p className={'branding-message'}>{brand}</p>
    </div>);
}

export default Branding;