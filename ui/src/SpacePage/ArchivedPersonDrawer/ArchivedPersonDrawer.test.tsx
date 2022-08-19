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

import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import TestUtils, { renderWithRecoil } from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import ArchivedPersonDrawer from './ArchivedPersonDrawer';
import { ViewingDateState } from 'State/ViewingDateState';
import { PeopleState } from 'State/PeopleState';

jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/SpaceClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/ProductTagClient');
jest.mock('Services/Api/PersonTagClient');

describe('Archived People', () => {
    const mayFourteen2020: Date = new Date(2020, 4, 14);
    const mayFourteen1999: Date = new Date(1999, 4, 14);
    let unmount: () => void;

    describe('Showing archived people', () => {
        beforeEach(async () => {
            ({ unmount } = renderWithRecoil(
                <ArchivedPersonDrawer />,
                ({ set }) => {
                    set(ViewingDateState, mayFourteen2020);
                    set(PeopleState, [
                        ...TestData.people,
                        TestData.unassignedBigBossSE,
                    ]);
                }
            ));
        });

        it('has the Archived Person drawer', async () => {
            expect(screen.getByText(/Archived People/)).toBeInTheDocument();
        });

        it('shows the names of two archived people but not one unarchived person', async () => {
            const drawerCaret = await screen.findByTestId(
                'archivedPersonDrawerCaret'
            );
            fireEvent.click(drawerCaret);
            expect(
                await screen.findByText(TestData.archivedPerson.name)
            ).toBeInTheDocument();
            expect(
                await screen.findByText(TestData.unassignedBigBossSE.name)
            ).toBeInTheDocument();
            expect(
                screen.queryByText(TestData.person1.name)
            ).not.toBeInTheDocument();
            expect(screen.getAllByTestId(/archivedPersonCard__*/)).toHaveLength(
                2
            );
            expect(
                (await screen.findByTestId('archivedPersonDrawerCountBadge'))
                    .innerHTML
            ).toEqual('2');
        });

        it('should not show people who have not passed their archived date', async () => {
            const drawerCaret = await screen.findByTestId(
                'archivedPersonDrawerCaret'
            );
            fireEvent.click(drawerCaret);
            expect(
                screen.queryByText(TestData.hank.name)
            ).not.toBeInTheDocument();
        });

        it('can be closed and opened again', async () => {
            const drawerCaret = await screen.findByTestId(
                'archivedPersonDrawerCaret'
            );
            fireEvent.click(drawerCaret);
            expect(
                await screen.findByText(TestData.archivedPerson.name)
            ).toBeInTheDocument();
            fireEvent.click(drawerCaret);
            expect(
                await screen.queryByText(TestData.archivedPerson.name)
            ).not.toBeInTheDocument();
        });

        it('should not show an archived person if the viewing date is before their archive date', async () => {
            unmount();

            renderWithRecoil(<ArchivedPersonDrawer />, ({ set }) => {
                set(ViewingDateState, mayFourteen1999);
                set(PeopleState, [
                    ...TestData.people,
                    TestData.unassignedBigBossSE,
                ]);
            });

            const drawerCaret = await screen.findByTestId(
                'archivedPersonDrawerCaret'
            );
            fireEvent.click(drawerCaret);
            expect(
                await screen.queryByText(TestData.archivedPerson.name)
            ).not.toBeInTheDocument();
            expect(
                await screen.findByText(TestData.unassignedBigBossSE.name)
            ).toBeInTheDocument();
            expect(
                screen.queryByText(TestData.person1.name)
            ).not.toBeInTheDocument();
            expect(screen.getAllByTestId(/archivedPersonCard__*/)).toHaveLength(
                1
            );
        });
    });

    describe('Showing the drawer in the app', () => {
        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent();
        });

        it('should show the archived people drawer', () => {
            expect(screen.getByText('Archived People')).toBeInTheDocument();
        });
    });
});
