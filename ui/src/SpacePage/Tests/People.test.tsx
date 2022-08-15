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

import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import AssignmentClient from 'Services/Api/AssignmentClient';
import PeopleClient from 'Services/Api/PeopleClient';
import TestUtils from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import selectEvent from 'react-select-event';
import {emptyPerson} from 'Services/PersonService';
import moment from 'moment';
import {ViewingDateState} from 'State/ViewingDateState';
import {Person} from 'Types/Person';

jest.mock('Services/Api/ProductClient');
jest.mock('Services/Api/PeopleClient');
jest.mock('Services/Api/SpaceClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/LocationClient');
jest.mock('Services/Api/PersonTagClient');
jest.mock('Services/Api/ProductTagClient');

describe('People actions', () => {
    const addPersonButtonText = 'Add Person';
    const submitFormButtonText = 'Add';

    beforeEach(() => {
        localStorage.removeItem('filters');
    })

    describe('Roles', () => {
        const viewingDate: Date = new Date(2020, 5, 5)

        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(({set}) => {
                set(ViewingDateState, viewingDate)
            });

            const createPersonButton = await screen.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await act(async () => {
                fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Some Name'}});
            });
        });

        it('allows choices of roles provided by the API', async () => {
            const labelElement = screen.getByLabelText('Role');
            const containerToFindOptionsIn = {container: screen.getByTestId('personForm')};
            await selectEvent.select(labelElement, /Product Manager/, containerToFindOptionsIn);

            fireEvent.click(screen.getByLabelText('Mark as New'));

            fireEvent.click(screen.getByText(submitFormButtonText));

            await waitFor(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'Some Name',
                    newPerson: true,
                    newPersonDate: viewingDate,
                    spaceRole: {
                        name: 'Product Manager',
                        id: 2,
                        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        color: TestData.color2,
                    },
                };
                expect(PeopleClient.createPersonForSpace).toHaveBeenLastCalledWith(TestData.space, expectedPerson);
            });
        });

        it('allows user to create a new role when creating a person', async () => {
            const personForm = screen.getByTestId('personForm');
            const labelElement = screen.getByLabelText('Role');
            const containerToFindOptionsIn = {
                container: personForm,
                createOptionText: TestUtils.expectedCreateOptionText('Product Owner'),
            };

            await act(async () => {
                await selectEvent.create(labelElement, 'Product Owner', containerToFindOptionsIn);
            });
            expect(personForm).toHaveFormValues({role: 'Product Owner'});

            fireEvent.click(screen.getByText(submitFormButtonText));

            await waitFor(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'Some Name',
                    spaceRole: {
                        name: 'Product Owner',
                        id: 1,
                        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        color: {color: '1', id: 2},
                    },
                };
                expect(PeopleClient.createPersonForSpace).toHaveBeenLastCalledWith(TestData.space, expectedPerson);
            });
        });

        it('display placeholder text when you clear role field ', async () => {
            const placeholderText = 'Add a role';
            expect(screen.getByText(placeholderText)).toBeDefined();

            const roleLabel = screen.getByLabelText('Role');
            const containerToFindOptionsIn = {container: screen.getByTestId('personForm')};
            await selectEvent.select(roleLabel, /Product Manager/, containerToFindOptionsIn);

            const personForm = screen.getByTestId('personForm');
            expect(personForm).toHaveFormValues({role: 'Product Manager'});
            expect(screen.queryByText(placeholderText)).not.toBeInTheDocument();

            await selectEvent.clearFirst(roleLabel);
            await waitFor(() => expect(screen.getByText(placeholderText)).toBeDefined());
        });

        it('should not submit form when you press ENTER key', async () => {
            const roleLabel = screen.getByLabelText('Role');
            fireEvent.change(roleLabel, {target: {value: 'Product Owner'}});

            fireEvent.keyDown(screen.getByLabelText('Role'), {key: 'Enter', code: 13});
            expect(await screen.findByText('Product Owner')).toBeDefined();
            expect(await screen.findByText(addPersonButtonText)).toBeDefined();
        });
    });

    describe('Creating person and assignments', () => {
        const viewingDate = new Date(2020, 5, 5);

        const expectedPerson: Person = {
            ...emptyPerson(),
            name: 'Some Name',
            spaceRole: {
                name: 'Software Engineer',
                id: 1,
                spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                color: TestData.color1,
            },
            newPerson: true,
            newPersonDate: viewingDate,
        };

        const checkForCreatedPerson = async (): Promise<void> => {
            expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
            expect(PeopleClient.createPersonForSpace).toBeCalledWith(TestData.space, expectedPerson);

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [],
                TestData.space,
                expectedPerson
            );
        };

        it('assigns the person created by the PersonForm', async () => {
            await TestUtils.renderPeopleMoverComponent(({set}) => {
                set(ViewingDateState, viewingDate)
            })
            const createPersonButton = await screen.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Some Name'}});

            const labelElement = await screen.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await screen.findByTestId('personForm')};
            await selectEvent.select(labelElement, /Software Engineer/, containerToFindOptionsIn);

            await screen.findByText('unassigned');

            fireEvent.click(screen.getByLabelText('Mark as New'));

            fireEvent.click(screen.getByText(submitFormButtonText));

            await waitFor(checkForCreatedPerson);
        });
    });
});