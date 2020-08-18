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
import MyTraits from '../Traits/MyTraits';
import RoleClient from './RoleClient';
import '../Traits/MyTraits.scss';
import {noop} from '@babel/types';

interface MyRolesModalProps {
    setShouldShowConfirmCloseModal?: Function;
}

function MyRolesModal({setShouldShowConfirmCloseModal}: MyRolesModalProps): JSX.Element {
    const [roleSectionOpen, setRoleSectionOpen] = useState<boolean>(false);

    useEffect(() => {
        if (setShouldShowConfirmCloseModal) {
            setShouldShowConfirmCloseModal(roleSectionOpen);

            return (): void => setShouldShowConfirmCloseModal(false);
        }
        return noop;
    }, [roleSectionOpen, setShouldShowConfirmCloseModal]);

    return (
        <div data-testid="myRolesModalContainer" className="myTraitsContainer">

            <MyTraits
                traitClient={RoleClient}
                setTraitSectionOpen={setRoleSectionOpen}
                colorSection
                traitType="person"
                traitName="role"
            />

            <div className="traitWarning">Note: Editing or deleting a role will affect any<br/>
                person currently assigned it.</div>

        </div>
    );
}

export default MyRolesModal;
