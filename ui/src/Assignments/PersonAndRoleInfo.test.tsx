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
import {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {fireEvent, screen} from '@testing-library/react';
import {IsReadOnlyState} from '../State/IsReadOnlyState';

describe('Tooltip behavior on hover', () => {
    it('should show the notes of the person being hovered over', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.hank}
                isUnassignedProduct={false}
                duration={parseInt('dontcare', 1)}
            />
        );

        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        expect(screen.queryByTestId('note-icon')).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.getByText('Notes:')).toBeInTheDocument();
        expect(screen.getByTestId('note-icon')).toBeInTheDocument();
        expect(screen.getByText("Don't forget the WD-40!")).toBeInTheDocument();
    });

    it('should not show the notes of the person being hovered over if they have none', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.person2}
                isUnassignedProduct={false}
                duration={parseInt('dontcare', 1)}
            />
        );

        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });

    it('should show the time on product of the person being hovered over', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.hank}
                isUnassignedProduct={false}
                duration={367}
            />
        );

        expect(screen.queryByText('Time on Product:')).not.toBeInTheDocument();
        expect(screen.queryByText('367 Days')).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.getByText('Time on Product:')).toBeInTheDocument();
        expect(screen.getByTestId('timer-icon')).toBeInTheDocument();
        expect(screen.getByText('367 Days')).toBeInTheDocument();
    });

    it('should show the person tags of the person being hovered over', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.person2}
                isUnassignedProduct={false}
                duration={parseInt('dontcare', 1)}
            />
        )

        expect(screen.queryByText('Person Tags:')).not.toBeInTheDocument();
        expect(screen.queryByTestId('local_offer-icon')).not.toBeInTheDocument();
        expect(screen.queryByText('The lil boss, The big boss')).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.getByText('Person Tags:')).toBeInTheDocument();
        expect(screen.getByTestId('local_offer-icon')).toBeInTheDocument();
        expect(screen.getByText('The lil boss, The big boss')).toBeInTheDocument();
    });

    it('should not show the person tags of the person being hovered over if they have none', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.unassignedPerson}
                isUnassignedProduct={false}
                duration={parseInt('dontcare', 1)}
            />
        )

        expect(screen.queryByText('Person Tags:')).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.queryByText('Person Tags: ')).not.toBeInTheDocument();
    });

    it('should not show the hover if the space is read only', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.hank}
                duration={0}
                isUnassignedProduct={false}
            />,
            ({set}) => {
                set(IsReadOnlyState, true)
            }
        )

        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });

    it('should not show the hover if it is part of the Unassigned product', async () => {
        renderWithRecoil(
            <PersonAndRoleInfo
                person={TestData.hank}
                duration={0}
                isUnassignedProduct={true}
            />
        )

        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        getItemAndFireMouseOverEvent('assignmentCardPersonInfo');
        expect(screen.queryByText('Notes:')).not.toBeInTheDocument();
        expect(screen.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });
});

const getItemAndFireMouseOverEvent = (testId: string): void => {
    fireEvent.mouseOver(screen.getByTestId(testId));
};
