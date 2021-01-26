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

import {removeToken} from '../Auth/TokenProvider';
import {Redirect} from 'react-router-dom';
import React from 'react';

interface Props {
    setRedirect: (redirectElement: JSX.Element) => void;
    focusOnRender?: boolean;
}

function SignOutButton({ setRedirect, focusOnRender = false }: Props): JSX.Element {
    const clearAccessTokenCookie = (): void => {
        removeToken();
        setRedirect(<Redirect to="/"/>);
    };

    return (
        <button
            autoFocus={focusOnRender}
            className="accountDropdownOption"
            role="menuitem"
            data-testid="sign-out"
            onClick={clearAccessTokenCookie}
        >
            Sign Out
        </button>
    );
}

export default SignOutButton;
