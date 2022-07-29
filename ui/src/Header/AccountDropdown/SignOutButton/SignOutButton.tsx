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

import {removeToken} from '../../../Services/TokenService';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {CurrentUserState} from '../../../State/CurrentUserState';

interface Props {
    focusOnRender?: boolean;
}

function SignOutButton({ focusOnRender = false }: Props): JSX.Element {
    const navigate = useNavigate();
    const setCurrentUser = useSetRecoilState(CurrentUserState);

    const clearAccessTokenCookie = (): void => {
        removeToken();
        setCurrentUser('');
        navigate('/', {replace: true})
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
