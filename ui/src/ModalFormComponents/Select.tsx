/*
 *   Copyright (c) 2020 Ford Motor Company
 *   All rights reserved.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, {ReactNode, useEffect, useState} from 'react';
import Option from './Option';
import './Select.scss';

interface OptionType {
    value: unknown;
    displayValue: ReactNode | string;
}

interface Props {
    defaultOption: OptionType;
    options: Array<OptionType>;
}

const Select = ({ options, defaultOption }: Props): JSX.Element => {
    const [currentOption, setCurrentOption] = useState<OptionType>(defaultOption);

    useEffect(() => {
        console.log(currentOption);
    }, [currentOption]);

    return (
        <div>
            <div>{currentOption.displayValue}</div>
            <div className="selectDropdown">
                {options && options.map((option, index) => {
                    return (
                        <Option key={`select-option-${index}`} onClick={(): void => {setCurrentOption(option);}}>
                            {option.displayValue}
                        </Option>
                    );
                })}
            </div>
        </div>
    );
};

export default Select;

