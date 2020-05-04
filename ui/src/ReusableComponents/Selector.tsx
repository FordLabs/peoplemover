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

import React, {useEffect, useState} from 'react';


interface SelectorProps {
    initiallyChosen?: Array<string>;
    callback(locations: Array<string>): void;
    choices: Array<string>;
}

function Selector({
    initiallyChosen,
    callback,
    choices,
}: SelectorProps): JSX.Element {
    const [selected, setSelected] = useState(initiallyChosen ? initiallyChosen : []);

    useEffect(() => {
        if (initiallyChosen != null) {
            setSelected(initiallyChosen);
        }
    }, [initiallyChosen]);

    function onChange(choice: string): void {
        let newSelections = selected;
        if (stateContains(choice)) {
            newSelections = newSelections.filter(item => item !== choice);
        } else {
            newSelections = newSelections.concat([choice]);
        }
        callback && callback(newSelections);
        setSelected(newSelections);
    }

    function stateContains(choice: string): boolean {
        return selected.includes(choice);
    }

    return (
        <div className="sub">
            {choices && choices.map((choice, index) => {
                return <label className="formInputLabel" key={index}>
                    <input
                        className="formInput checkbox"
                        type="checkbox"
                        checked={stateContains(choice)}
                        onChange={(): void => onChange(choice)}/>
                    {choice}
                </label>;
            })}
        </div>
    );
}

export default Selector;
