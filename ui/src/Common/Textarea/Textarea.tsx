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

import React, {ComponentPropsWithoutRef} from 'react';

import './Textarea.scss';

type Props = ComponentPropsWithoutRef<'textarea'> & {
    value?: string;
    label?: string;
    invalid?: boolean;
    validationMessage?: string;
};

function Textarea(props: Props) {
    const {
        id = 'textarea-id',
        label,
        value,
        onChange,
        className,
        ...textareaProps
    } = props;

    return (
        <>
            <label htmlFor={id} className="text-area-label">{label}</label>
            <textarea
                id={id}
                name="textarea"
                onChange={onChange}
                className={`text-area-field ${className}`}
                {...textareaProps} />
        </>
    )
}

export default Textarea;