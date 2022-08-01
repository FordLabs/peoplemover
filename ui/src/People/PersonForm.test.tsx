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

import {renderWithRecoil} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import PersonForm from './PersonForm';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import selectEvent from 'react-select-event';
import PersonTagClient from '../Services/Api/PersonTagClient';
import {TagRequest} from '../Types/TagRequest';
import AssignmentClient from '../Services/Api/AssignmentClient';
import PeopleClient from '../Services/Api/PeopleClient';
import {emptyPerson} from './PersonService';
import moment from 'moment';
import {ViewingDateState} from '../State/ViewingDateState';
import {ProductsState} from '../State/ProductsState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import {MutableSnapshot} from 'recoil';
import {Person} from '../Types/Person';

jest.mock('Services/Api/PeopleClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/ProductTagClient');
jest.mock('Services/Api/PersonTagClient');

describe('Person Form', () => {
    const mayFourteen: Date = new Date(2020, 4, 14);
    const recoilState = ({set}: MutableSnapshot) => {
        set(ViewingDateState, mayFourteen);
        set(ProductsState, TestData.products)
        set(CurrentSpaceState, TestData.space)
    }

    beforeEach(() => {
        AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [{...TestData.assignmentForPerson1}] });
    })

    describe('Creating a new person', () => {
        beforeEach(async () => {
            renderWithRecoil(<PersonForm isEditPersonForm={false}/>, recoilState);
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
            await waitFor(() => expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestData.space, expectedPerson));
        });
    });

    describe('Editing an existing person', () => {
        const setupPersonForm = async () => {
            AssignmentClient.getAssignmentsV2ForSpaceAndPerson = jest.fn().mockResolvedValue({
                data: [{...TestData.assignmentForHank, endDate: null},
                    TestData.assignmentVacationForHank,
                    TestData.previousAssignmentForHank],
            });

            renderWithRecoil(
                <PersonForm
                    isEditPersonForm={true}
                    initiallySelectedProduct={TestData.productForHank}
                    initialPersonName={TestData.hank.name}
                    personEdited={TestData.hank}
                />,
                ({set}) => {
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
                }
            );
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
        }

        it('display the person\'s existing tags when editing a person', async () => {
            await setupPersonForm();
            expect(await screen.findByText('The lil boss')).toBeDefined();
        });

        it('should display assignment history text', async () => {
            await setupPersonForm();
            expect(await screen.findByText('View Assignment History')).toBeDefined();
        });

        it('should only display active assignable projects in the assignment dropdown', async () => {
            await setupPersonForm();
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
            renderWithRecoil(
                <PersonForm isEditPersonForm={true} personEdited={TestData.unassignedPerson}/>,
                recoilState
            );
            expect(await screen.findByText('unassigned')).toBeInTheDocument();
        });

        it('should show Archived in the AssignTo field for an archived person', async () => {
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({
                data: [TestData.assignmentForArchived],
            });
            renderWithRecoil(
                <PersonForm isEditPersonForm={true} personEdited={TestData.archivedPerson}/>,
                recoilState
            );
            expect(await screen.findByText('archived')).toBeInTheDocument();
        });
    });

    describe('handleSubmit()', () => {
        it('should not call createAssignmentForDate when assignment not changed to a different product', async () => {
            renderWithRecoil(
                <PersonForm
                    isEditPersonForm={true}
                    initiallySelectedProduct={TestData.productForHank}
                    personEdited={TestData.hank}
                />,
                recoilState
            );

            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(0));
        });

        it('should call createAssignmentForDate when assignment has been deliberately changed to unassigned', async () => {
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({data: TestData.hank});

            const { container } = renderWithRecoil(
                <PersonForm
                    isEditPersonForm={true}
                    initiallySelectedProduct={TestData.productForHank}
                    initialPersonName={TestData.hank.name}
                    personEdited={TestData.hank}
                />,
                recoilState
            );
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            const removeProductButton = container.getElementsByClassName('product__multi-value__remove');
            await waitFor(() => expect(removeProductButton.length).toEqual(1));
            fireEvent.click(removeProductButton[0]);

            fireEvent.click(await screen.findByText('Save'));

            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1));
        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            renderWithRecoil(
                <PersonForm
                    isEditPersonForm={true}
                    initiallySelectedProduct={TestData.productForHank}
                    initialPersonName={TestData.hank.name}
                    personEdited={TestData.hank}
                />,
                recoilState
            );
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())

            fireEvent.click(await screen.findByTestId('personFormIsNewCheckbox'));
            fireEvent.click(await screen.findByText('Save'));

            const expectedPerson: Person =  {...TestData.hank, newPerson: true, newPersonDate: mayFourteen};
            await waitFor(() => expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestData.space, expectedPerson));
        });

        it('should send a regular assignment request on an unarchived person', async () => {
            const updatedPerson = {...TestData.archivedPerson, archiveDate: null};
            PeopleClient.updatePerson = jest.fn().mockResolvedValue({ data: updatedPerson });
            AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({
                data: [ {...TestData.assignmentForUnassigned, productId: TestData.productWithoutAssignments.id} ]
            })
            AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [TestData.assignmentForArchived] });

            renderWithRecoil(
                <PersonForm
                    isEditPersonForm={true}
                    personEdited={TestData.archivedPerson}
                />,
                ({set}) => {
                    set(ViewingDateState, mayFourteen);
                    set(ProductsState, [TestData.unassignedProduct, TestData.productWithoutAssignments]);
                    set(CurrentSpaceState, TestData.space)
                }
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
});
