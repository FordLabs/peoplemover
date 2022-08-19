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
import errorImageSrc from 'Assets/403.png';
import ErrorPageTemplate from './ErrorPageTemplate/ErrorPageTemplate';

function ForbiddenErrorPage() {
    return (
        <ErrorPageTemplate
            errorGraphic={errorImageSrc}
            errorText="You don't have access to this page. Please request access."
        />
    );
}

export default ForbiddenErrorPage;
