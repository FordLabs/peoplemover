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
import AnimatedImageSrc from 'Assets/404.gif';
import ErrorPageTemplate from './ErrorPageTemplate/ErrorPageTemplate';

function NotFoundErrorPage() {
    return (
        <ErrorPageTemplate
            errorGraphic={AnimatedImageSrc}
            errorText="We can't seem to find the page you're looking for. Please double check your link."
        />
    );
}

export default NotFoundErrorPage;
