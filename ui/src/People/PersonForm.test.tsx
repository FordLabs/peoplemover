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

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import PersonForm from './PersonForm';
import configureStore from 'redux-mock-store';
import React from 'react';
import {fireEvent, waitFor, screen, RenderResult} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import selectEvent from 'react-select-event';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {TagRequest} from '../Tags/TagRequest.interface';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from './PeopleClient';
import {AxiosResponse} from 'axios';
import {emptyPerson, Person} from './Person';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import moment from 'moment';

declare let window: MatomoWindow;

describe('Person Form', () => {
    const mayFourteen: Date = new Date(2020, 4, 14);

    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: TestUtils.space,
        viewingDate: mayFourteen,
        allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        roles: TestUtils.roles,
    });

    describe('Creating a new person', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await act(async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={false}
                        products={TestUtils.products}
                    />, store);
            });
        });

        it('create new person tags when one is typed in which does not already exist', async () => {
            await act(async () => {
                const personTagsLabel = await screen.findByLabelText('Person Tags');
                await selectEvent.create(personTagsLabel, 'Low Achiever');
                const expectedPersonTagAddRequest: TagRequest = {name: 'Low Achiever'};
                await expect(PersonTagClient.add).toHaveBeenCalledWith(expectedPersonTagAddRequest, TestUtils.space);
                const form = await screen.findByTestId('personForm');
                expect(form).toHaveFormValues({personTags: '1337_Low Achiever'});
            });
        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            await act(async () => {
                fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'person'}});
                fireEvent.click(screen.getByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Add'));
            });

            const expectedPerson: Person = {
                ...emptyPerson(),
                name: 'person',
                newPerson: true,
                newPersonDate: mayFourteen,
            };
            expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestUtils.space, expectedPerson, []);
        });
    });

    describe('Editing an existing person', () => {
        let unmount: () => void;

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn(() => Promise.resolve({
                data: [{...TestUtils.assignmentForHank, endDate: null},
                    TestUtils.assignmentVacationForHank,
                    TestUtils.previousAssignmentForHank],
            } as AxiosResponse));
            await waitFor(async () => {
                ({unmount} = renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={[...TestUtils.products,
                            {
                                id: 500,
                                name: 'Already Closed Product',
                                spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                                startDate: '2011-01-01',
                                endDate: '2011-02-02',
                                assignments: [],
                                archived: false,
                                tags: [],
                            }]
                        }
                        initiallySelectedProduct={TestUtils.productForHank}
                        initialPersonName={TestUtils.hank.name}
                        personEdited={TestUtils.hank}
                    />, store)
                );
            });
        });

        it('display the person\'s existing tags when editing a person', async () => {
            await act(async () => {
                await screen.findByText('The lil boss');
            });
        });

        it('should display assignment history text', async () => {
            await act(async () => {
                await screen.findByText('View Assignment History');
            });
        });

        it('should only display active assignable projects in the assignment dropdown', async () => {
            const assignmentDropDown = await screen.getByLabelText('Assign to');
            await waitFor(() => {
                selectEvent.openMenu(assignmentDropDown);
            });
            expect(screen.queryByText(TestUtils.unassignedProduct.name)).not.toBeInTheDocument();
            await screen.findByText(TestUtils.productWithAssignments.name);
            await screen.findByText(TestUtils.productForHank.name);
            await screen.findByText(TestUtils.productWithoutAssignments.name);
            expect(screen.queryByText(TestUtils.archivedProduct.name)).not.toBeInTheDocument();
            await screen.findByText(TestUtils.productWithoutLocation.name);
            expect(screen.queryByText('Already Closed Product')).not.toBeInTheDocument();
        });

        it('should show unassigned in the AssignTo field for an unassigned person', async () => {
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestUtils.assignmentForUnassigned],
            });
            unmount();
            await act(async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        personEdited={TestUtils.unassignedPerson}
                    />, store);
            });
            expect(await screen.findByText('unassigned')).toBeInTheDocument();
        });

        it('should show Archived in the AssignTo field for an archived person', async () => {
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestUtils.assignmentForArchived],
            });
            unmount();
            await act(async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        personEdited={TestUtils.archivedPerson}
                    />, store);
            });
            expect(await screen.findByText('archived')).toBeInTheDocument();
        });
    });

    describe('handleSubmit()', () => {
        it('should not call createAssignmentForDate when assignment not changed to a different product', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act(async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });

            await act(async () => {
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(0);

        });

        it('should call createAssignmentForDate when assignment has been deliberately changed to unassigned', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({data: TestUtils.hank});

            let personForm: RenderResult;

            await act( async () => {
                personForm = renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        initialPersonName={TestUtils.hank.name}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });

            const removeProductButton = personForm!.baseElement.getElementsByClassName('product__multi-value__remove');
            expect(removeProductButton.length).toEqual(1);
            fireEvent.click(removeProductButton[0]);

            await act( async () => {
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1);

        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        initialPersonName={TestUtils.hank.name}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Save'));
            });

            const expectedPerson: Person =  {...TestUtils.hank, newPerson: true, newPersonDate: mayFourteen};
            expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestUtils.space, expectedPerson, []);
        });

        it('should send a regular assignment request on an unarchived person', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            const updatedPerson = {...TestUtils.archivedPerson, archiveDate: null};
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({
                data: updatedPerson,
            });
            AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({
                data: [{...TestUtils.assignmentForUnassigned, productId: TestUtils.productWithoutAssignments.id}],
            })
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestUtils.assignmentForArchived],
            });
            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={[TestUtils.unassignedProduct, TestUtils.productWithoutAssignments]}
                        personEdited={TestUtils.archivedPerson}
                    />, store, undefined);
            });
            await selectEvent.openMenu(await screen.findByLabelText('Assign to'));
            await screen.findByText(TestUtils.productWithoutAssignments.name);
            await selectEvent.select(await screen.findByLabelText('Assign to'), TestUtils.productWithoutAssignments.name);
            await waitFor( async () => {
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(
                moment(mayFourteen).format('YYYY-MM-DD'),
                [{'placeholder': false, 'productId': TestUtils.productWithoutAssignments.id}],
                TestUtils.space,
                updatedPerson);
        });
    });

    describe('handleMatomoEventsForNewPersonCheckboxChange()', () => {
        let originalWindow: Window;

        afterEach(() => {
            window._paq = [];
            (window as Window) = originalWindow;
        });

        it('newPerson box goes from unchecked to checked, call matomo event for newPersonChecked action',  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'newPersonChecked', TestUtils.hank.name]);
        });

        it('newPerson box goes from checked to unchecked, call matomo event for newPersonUnchecked action',  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            let newHank: Person = {...TestUtils.hank, newPerson: true, newPersonDate: new Date(2019, 4, 14)};

            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        personEdited={newHank}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'newPersonUnchecked', newHank.name + ', 366 day(s)']);
        });

        it('newPerson box goes from checked to unchecked to checked, DO NOT call any matomo event',  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            let newHank: Person = {...TestUtils.hank, name: 'XXXX', newPerson: true, newPersonDate: new Date(2019, 4, 14)};

            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        personEdited={newHank}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(window._paq).toEqual([]);
        });

        it('newPerson box goes from unchecked to checked to unchecked, DO NOT call matomo event',  async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act( async () => {
                renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await screen.findByText('Save'));
            });

            expect(window._paq).toEqual([]);
        });

    });
});
