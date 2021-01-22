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
import React, {ReactNode} from 'react';

import './FormButton.scss';

type ButtonStyle = 'primary' | 'secondary';
type ButtonType = 'submit' | 'reset' | 'button';

interface Props {
    children: ReactNode;
    onClick?: () => void;
    type?: ButtonType;
    buttonStyle?: ButtonStyle;
    className?: string;
    testId?: string;
    disabled?: boolean;
}

const FormButton = ({
    children,
    onClick,
    type = 'button',
    buttonStyle = 'primary',
    className,
    testId,
    disabled,
}: Props): JSX.Element => (
    <button
        onClick={onClick}
        className={`formButton ${buttonStyle}Button ${className || ''}`}
        type={type}
        data-testid={testId}
        disabled={disabled}
    >
        {children}
    </button>
);

export default FormButton;
