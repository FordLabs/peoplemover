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

import React, {useEffect, useState} from 'react';
import {JSX} from '@babel/types';
import {Color} from 'Types/RoleTag';
import ColorClient from 'Roles/ColorClient';
import RoleTags from 'Roles/RoleTags';

import '../ModalFormComponents/TagRowsContainer.scss';

function MyRolesForm(): JSX.Element {
    const [colors, setColors] = useState<Array<Color>>([]);

    useEffect(() => {
        ColorClient.getAllColors().then(response => {
            setColors(response.data);
        });
    }, []);

    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">
            {colors.length && <RoleTags colors={colors} />}
            <div className="traitWarning">
                <i className="material-icons warningIcon">error</i>
                <p className="warningText">Editing or deleting a role will affect any person currently assigned to it.</p>
            </div>
        </div>
    );
}

export default MyRolesForm;
