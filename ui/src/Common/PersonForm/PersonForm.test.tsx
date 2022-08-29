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

import {renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import PersonForm from './PersonForm';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import selectEvent from 'react-select-event';
import PersonTagClient from 'Services/Api/PersonTagClient';
import {TagRequest} from 'Types/TagRequest';
import AssignmentClient from 'Services/Api/AssignmentClient';
import PeopleClient from 'Services/Api/PeopleClient';
import {emptyPerson} from 'Services/PersonService';
import moment from 'moment';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {MutableSnapshot} from 'recoil';
import {Person} from 'Types/Person';

jest.mock('Services/Api/PeopleClient');
jest.mock('Services/Api/RoleClient');
jest.mock('Services/Api/AssignmentClient');
jest.mock('Services/Api/ProductTagClient');
jest.mock('Services/Api/PersonTagClient');

describe('Person Form', () => {
    const viewingDate: Date = new Date(2020, 4, 14);
    const recoilState = ({set}: MutableSnapshot) => {
        set(ViewingDateState, viewingDate);
        set(ProductsState, TestData.products)
        set(CurrentSpaceState, TestData.space)
    }

    beforeEach(() => {
        AssignmentClient.getAssignmentsUsingPersonIdAndDate = jest.fn().mockResolvedValue({ data: [{...TestData.assignmentForPerson1}] });
    })

    it('should have correct placeholder texts and defaults', async () => {
        renderWithRecoil(
            <PersonForm isEditPersonForm={false} />,
            ({set}) => {
                set(CurrentSpaceState, TestData.space)
            }
        );

        await waitFor(() => expect(screen.getByPlaceholderText('e.g. Jane Smith')).toBeDefined());
        const isNewCheckbox = screen.getByTestId('personFormIsNewCheckbox');
        expect(isNewCheckbox).not.toBeChecked();
        expect(screen.getByPlaceholderText('e.g. jsmith12')).toBeDefined();
        expect(screen.getByText('Add a role')).toBeDefined();
        expect(screen.getByText('unassigned')).toBeDefined();
        expect(screen.getByText('Add person tags')).toBeDefined();
        expect(screen.getByText('0 (255 characters max)')).toBeDefined();
    });

    it('should pre-populate form', async () => {
        const viewingDate = new Date(2021, 4, 13);
        const person = {...TestData.person1, newPerson: true}
        renderWithRecoil(
            <PersonForm isEditPersonForm personEdited={person} />,
            ({set}) => {
                set(CurrentSpaceState, TestData.space)
                set(ViewingDateState, viewingDate)
                set(ProductsState, [TestData.productWithAssignments])
            }
        );
        await waitFor(() => expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate).toHaveBeenCalledWith(
            TestData.space.uuid, person.id, viewingDate
        ))
        const expectedPersonName = person.name;
        expect(screen.getByDisplayValue(expectedPersonName)).toBeDefined();

        const isNewCheckbox = screen.getByTestId('personFormIsNewCheckbox');
        expect(isNewCheckbox).toBeChecked();

        const expectedCDSID = person.customField1!;
        expect(screen.getByDisplayValue(expectedCDSID)).toBeDefined();
        const expectedRole = TestData.softwareEngineer.name;
        expect(screen.getByDisplayValue(expectedRole)).toBeDefined();
        const expectedProductName = TestData.productWithAssignments.name
        expect(screen.getByDisplayValue(expectedProductName)).toBeDefined();

        const expectedPersonTag = person.tags[0].name;
        expect(screen.getByText(expectedPersonTag)).toBeDefined();
        const expectedNote = person.notes!;
        expect(screen.getByDisplayValue(expectedNote)).toBeDefined();
        expect(screen.getByText(`${expectedNote.length} (255 characters max)`)).toBeDefined();
    });

    it('should not show the unassigned product or archived products in product list', async () => {
        const products = [TestData.productWithAssignments, TestData.archivedProduct, TestData.unassignedProduct];
        renderWithRecoil(
            <PersonForm
                isEditPersonForm={false}
                initialPersonName="BRADLEY"
            />,
            ({set}) => {
                set(ProductsState, products)
                set(CurrentSpaceState, TestData.space)
            }
        );

        expect(screen.getByText('unassigned')).toBeDefined();

        const productTextToSelect = 'Product 1';
        const productsMultiSelectField = await screen.findByLabelText('Assign to');
        await selectEvent.select(productsMultiSelectField, productTextToSelect);

        const product1Option = screen.getByText(productTextToSelect);
        expect(product1Option).toBeDefined();
        expect(product1Option).toHaveClass('product__multi-value__label');

        expect(screen.queryByText('I am archived')).toBeNull();
        expect(screen.queryByText('unassigned')).toBeNull();
    });

    it('should remove the unassigned product when a product is selected from dropdown', async () => {
        const products = [TestData.productWithAssignments, TestData.unassignedProduct];
        renderWithRecoil(
            <PersonForm
                isEditPersonForm={false}
                initialPersonName="BRADLEY"
            />,
            ({set}) => {
                set(ProductsState, products)
                set(CurrentSpaceState, TestData.space)
            }
        );
        const productDropDown = screen.getByLabelText('Assign to');
        expect(screen.getByText('unassigned')).toBeDefined();
        await selectEvent.select(productDropDown, 'Product 1');

        expect(screen.queryByText('unassigned')).not.toBeInTheDocument();
    });

    describe('Creating a new person', () => {
        beforeEach(async () => {
            renderWithRecoil(<PersonForm isEditPersonForm={false}/>, recoilState);
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
        });

        it('should not submit assignment when nothing changed', async () => {
            fireEvent.click(screen.getByText('Add'));
            await waitFor(() => expect(AssignmentClient.createAssignmentForDate).not.toBeCalled());
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
                newPersonDate: viewingDate,
            };
            await waitFor(() => expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestData.space, expectedPerson));
        });

        it('should populate person form and create person', async () => {
            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'New Bobby'}});
            fireEvent.change(screen.getByLabelText('Role'), {target: {value: 'Software Engineer'}});
            fireEvent.change(screen.getByLabelText('CDSID'), {target: {value: 'btables1'}});
            fireEvent.click(screen.getByLabelText('Mark as New'));

            await selectEvent.create(await screen.findByLabelText('Person Tags'), 'Low Achiever');
            await screen.findByText('Low Achiever')

            fireEvent.click(screen.getByText('Add'));

            await waitFor(() => expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1));
            const expectedPerson: Person = {
                ...emptyPerson(),
                name: 'New Bobby',
                customField1: 'btables1',
                newPerson: true,
                newPersonDate: viewingDate,
                tags: [{
                    id: 1337,
                    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                    name: 'Low Achiever',
                }],
            };
            expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestData.space, expectedPerson);
        });

        it('should not create person with empty value and display proper error message', async () => {
            fireEvent.change(screen.getByLabelText('Name'), {target: {value: ''}});
            fireEvent.click(screen.getByText('Add'));

            await waitFor(() => expect(PeopleClient.createPersonForSpace).toBeCalledTimes(0));

            expect(screen.getByText('Please enter a person name.')).toBeInTheDocument();
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
                    set(ViewingDateState, viewingDate);
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

        it('should display the person\'s existing tags when editing a person', async () => {
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

            const expectedPerson: Person =  {...TestData.hank, newPerson: true, newPersonDate: viewingDate};
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
                    set(ViewingDateState, viewingDate);
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
                moment(viewingDate).format('YYYY-MM-DD'),
                [{'placeholder': false, 'productId': TestData.productWithoutAssignments.id}],
                TestData.space,
                updatedPerson
            ));
        });
    });

    describe('Deleting a person', () => {
        beforeEach(async () => {
            renderWithRecoil(<PersonForm isEditPersonForm={true}/>, recoilState);
            await waitFor(() => expect(PersonTagClient.get).toHaveBeenCalled())
            fireEvent.click(await screen.findByText('Delete'));
        });

        it('should shows the confirmation modal when the delete button is clicked', () => {
            expect(screen.getByText(/Are you sure?/i)).toBeDefined();
        });

        it('should not show the confirmation modal after the cancel button is clicked', () => {
            fireEvent.click(screen.getByTestId('confirmationModalCancel'));
            expect(screen.queryByTestId('confirmationModalCancel')).toBeNull();
            expect(screen.queryByText(/Are you sure?/i)).toBeNull();
        });

        it('should not show the confirmation modal after the delete button is clicked', () => {
            fireEvent.click(screen.getByTestId('confirmDeleteButton'));
            expect(screen.queryByText(/Are you sure you want to delete/i)).toBeNull();
            expect(screen.queryByText(/Edit Person/i)).toBeNull();
        });
    });
});
