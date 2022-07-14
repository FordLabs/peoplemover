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

import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import PersonForm from './PersonForm';
import configureStore from 'redux-mock-store';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import selectEvent from 'react-select-event';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {TagRequest} from '../Tags/TagRequest.interface';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from './PeopleClient';
import {emptyPerson, Person} from './Person';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import moment from 'moment';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';

declare let window: MatomoWindow;

jest.mock('People/PeopleClient');
jest.mock('Roles/RoleClient');
jest.mock('Assignments/AssignmentClient');
jest.mock('Tags/ProductTag/ProductTagClient');
jest.mock('Tags/PersonTag/PersonTagClient');

describe('Person Form', () => {
    const mayFourteen: Date = new Date(2020, 4, 14);

    const mockStore = configureStore([]);
    const store = mockStore({
        allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
    });

    beforeEach(() => {
        AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [{...TestData.assignmentForPerson1}] });
    })

    describe('Creating a new person', () => {
        beforeEach(async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products)
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm isEditPersonForm={false}/>
                </RecoilRoot>,
                store
            );

            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
        });

        it('create new person tags when one is typed in which does not already exist', async () => {
            const personTagsLabel = await screen.findByLabelText('Person Tags');
            await selectEvent.create(personTagsLabel, 'Low Achiever');
            const expectedPersonTagAddRequest: TagRequest = {name: 'Low Achiever'};
            await expect(PersonTagClient.add).toHaveBeenCalledWith(expectedPersonTagAddRequest, TestData.space);
            const form = await screen.findByTestId('personForm');
            expect(form).toHaveFormValues({personTags: '1337_Low Achiever'});
        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'person'}});
            fireEvent.click(screen.getByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Add'));

            const expectedPerson: Person = {
                ...emptyPerson(),
                name: 'person',
                newPerson: true,
                newPersonDate: mayFourteen,
            };
            await waitFor(() => expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestData.space, expectedPerson, []));
        });
    });

    describe('Editing an existing person', () => {
        let unmount: () => void;

        beforeEach(async () => {
            AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
                data: [{...TestData.assignmentForHank, endDate: null},
                    TestData.assignmentVacationForHank,
                    TestData.previousAssignmentForHank],
            });

            ({unmount} = renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, [
                        ...TestData.products,
                        {
                            id: 500,
                            name: 'Already Closed Product',
                            spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                            startDate: '2011-01-01',
                            endDate: '2011-02-02',
                            assignments: [],
                            archived: false,
                            tags: [],
                        }
                    ]);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        initialPersonName={TestData.hank.name}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            ));

            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
        });

        it('display the person\'s existing tags when editing a person', async () => {
            expect(await screen.findByText('The lil boss')).toBeDefined();
        });

        it('should display assignment history text', async () => {
            expect(await screen.findByText('View Assignment History')).toBeDefined();
        });

        it('should only display active assignable projects in the assignment dropdown', async () => {
            const assignmentDropDown = await screen.getByLabelText('Assign to');
            await selectEvent.openMenu(assignmentDropDown);
            expect(screen.queryByText(TestData.unassignedProduct.name)).not.toBeInTheDocument();
            await screen.findByText(TestData.productWithAssignments.name);
            await screen.findByText(TestData.productForHank.name);
            await screen.findByText(TestData.productWithoutAssignments.name);
            expect(screen.queryByText(TestData.archivedProduct.name)).not.toBeInTheDocument();
            await screen.findByText(TestData.productWithoutLocation.name);
            expect(screen.queryByText('Already Closed Product')).not.toBeInTheDocument();
        });

        it('should show unassigned in the AssignTo field for an unassigned person', async () => {
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestData.assignmentForUnassigned],
            });
            unmount();
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        personEdited={TestData.unassignedPerson}
                    />
                </RecoilRoot>,
                store
            );
            expect(await screen.findByText('unassigned')).toBeInTheDocument();
        });

        it('should show Archived in the AssignTo field for an archived person', async () => {
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestData.assignmentForArchived],
            });
            unmount();
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        personEdited={TestData.archivedPerson}
                    />
                </RecoilRoot>,
                store
            );
            expect(await screen.findByText('archived')).toBeInTheDocument();
        });
    });

    describe('handleSubmit()', () => {
        it('should not call createAssignmentForDate when assignment not changed to a different product', async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            );

            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(0));
        });

        it('should call createAssignmentForDate when assignment has been deliberately changed to unassigned', async () => {
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({data: TestData.hank});

            const personForm =  renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        initialPersonName={TestData.hank.name}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            );
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            const removeProductButton = personForm!.baseElement.getElementsByClassName('product__multi-value__remove');
            expect(removeProductButton.length).toEqual(1);
            fireEvent.click(removeProductButton[0]);

            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1));

        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        initialPersonName={TestData.hank.name}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            );
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            const expectedPerson: Person =  {...TestData.hank, newPerson: true, newPersonDate: mayFourteen};
            await waitFor(() => expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestData.space, expectedPerson, []));
        });

        it('should send a regular assignment request on an unarchived person', async () => {
            const updatedPerson = {...TestData.archivedPerson, archiveDate: null};
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({ data: updatedPerson });
            AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({
                data: [ {...TestData.assignmentForUnassigned, productId: TestData.productWithoutAssignments.id} ]
            })
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [TestData.assignmentForArchived] });

            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, [TestData.unassignedProduct, TestData.productWithoutAssignments]);
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        personEdited={TestData.archivedPerson}
                    />
                </RecoilRoot>,
                store
            );

            await selectEvent.openMenu(await screen.findByLabelText('Assign to'));
            await screen.findByText(TestData.productWithoutAssignments.name);
            await selectEvent.select(await screen.findByLabelText('Assign to'), TestData.productWithoutAssignments.name);

            fireEvent.click(await screen.findByText('Save'));

            await waitFor( async () => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1));
            await waitFor( async () => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(
                moment(mayFourteen).format('YYYY-MM-DD'),
                [{'placeholder': false, 'productId': TestData.productWithoutAssignments.id}],
                TestData.space,
                updatedPerson
            ));
        });
    });

    describe('handleMatomoEventsForNewPersonCheckboxChange()', () => {
        let originalWindow: Window;

        beforeEach(() => {
            window._paq = [];
            (window as Window) = originalWindow;
        });

        it('newPerson box goes from unchecked to checked, call matomo event for newPersonChecked action',  async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            );

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(window._paq).toContainEqual(['trackEvent', TestData.space.name, 'newPersonChecked', TestData.hank.name]));
        });

        it('newPerson box goes from checked to unchecked, call matomo event for newPersonUnchecked action',  async () => {
            const newHank: Person = {...TestData.hank, newPerson: true, newPersonDate: new Date(2019, 4, 14)};

            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        personEdited={newHank}
                    />
                </RecoilRoot>,
                store
            );

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(window._paq).toContainEqual(['trackEvent', TestData.space.name, 'newPersonUnchecked', newHank.name + ', 366 day(s)']));
        });

        it('newPerson box goes from checked to unchecked to checked, DO NOT call any matomo event',  async () => {
            const newHank: Person = {...TestData.hank, name: 'XXXX', newPerson: true, newPersonDate: new Date(2019, 4, 14)};

            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                    set(CurrentSpaceState, TestData.space)
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        personEdited={newHank}
                    />
                </RecoilRoot>,
                store
            );

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(window._paq).toEqual([]));
        });

        it('newPerson box goes from unchecked to checked to unchecked, DO NOT call matomo event',  async () => {
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, TestData.products);
                }}>
                    <PersonForm
                        isEditPersonForm={true}
                        initiallySelectedProduct={TestData.productForHank}
                        personEdited={TestData.hank}
                    />
                </RecoilRoot>,
                store
            );

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(window._paq).toEqual([]));
        });
    });
});
