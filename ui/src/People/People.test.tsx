/*
 * Copyright (c) 2021 Ford Motor Company
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
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import PersonForm from '../People/PersonForm';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import {PreloadedState} from 'redux';
import {GlobalStateProps} from '../Redux/Reducers';
import selectEvent from 'react-select-event';
import {emptyPerson, Person} from './Person';
import moment from 'moment';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import ProductClient from '../Products/ProductClient';
import {ViewingDateState} from '../State/ViewingDateState';
import {RecoilRoot} from 'recoil';

declare let window: MatomoWindow;

jest.mock('../Products/ProductClient');

describe('People actions', () => {
    const initialState: PreloadedState<Partial<GlobalStateProps>> = {currentSpace: TestUtils.space};
    const addPersonButtonText = 'Add Person';
    const addPersonModalTitle = 'Add New Person';
    const submitFormButtonText = 'Add';

    beforeEach(() => {
        ProductClient.getProductsForDate = jest.fn().mockResolvedValue({ data: [] })

        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('Person Form', () => {
        const personFormInitialState: PreloadedState<Partial<GlobalStateProps>> = {
            people: TestUtils.people,
            currentSpace: TestUtils.space,
            allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        };
        const viewingDate = new Date(2020, 5, 5)

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await TestUtils.renderPeopleMoverComponent(undefined, personFormInitialState, ({set}) => {
                set(ViewingDateState, viewingDate)
            });
            await screen.findByText(addPersonButtonText);
        });

        it('opens PersonForm component in editing mode when hamburger icon is clicked', async () => {
            const editPersonIcon = await screen.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonIcon);

            const editPersonButton = await screen.findByText('Edit Person');
            fireEvent.click(editPersonButton);

            await waitFor(() => expect(screen.findByText('Save')).toBeDefined());
        });

        it('opens PersonForm component when Add Person button is clicked', async () => {
            const createPersonButton = await screen.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            expect(await screen.findByText(addPersonModalTitle)).toBeDefined();
        });

        it('While editing, queries the Assignment Client on load for products this person is assigned to', async () => {
            const editPersonButton = await screen.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonButton);

            await waitFor(() => expect(screen.getByText('Edit Person')).toBeDefined());

            fireEvent.click(await screen.findByText('Edit Person'));

            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            await waitFor(() => expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate)
                .toBeCalledWith(
                    TestUtils.space.uuid,
                    TestUtils.person1.id,
                    new Date(2020, 5, 5)
                )
            );
        });

        it('should show placeholder text for the person name', async () => {
            const createPersonButton = screen.getByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await waitFor(() => expect(screen.getByPlaceholderText('e.g. Jane Smith')).toBeDefined());
        });

        it('should show placeholder text for the person cdsid', async () => {
            const createPersonButton = screen.getByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await waitFor(() => expect(screen.getByPlaceholderText('e.g. jsmith12')).toBeDefined());
        });

        it('should not submit assignment when nothing changed', async () => {
            const createPersonButton = screen.getByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.click(screen.getByText(submitFormButtonText));

            await waitFor(() =>
                expect(AssignmentClient.createAssignmentForDate).not.toBeCalled()
            );
        });

        it('creates the person specified by the PersonForm', async () => {
            fireEvent.click(screen.getByText(addPersonButtonText));

            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'New Bobby'}});
            fireEvent.change(screen.getByLabelText('Role'), {target: {value: 'Software Engineer'}});
            fireEvent.change(screen.getByLabelText('CDSID'), {target: {value: 'btables1'}});
            fireEvent.click(screen.getByLabelText('Mark as New'));

            await selectEvent.create(await screen.findByLabelText('Person Tags'), 'Low Achiever');
            await screen.findByText('Low Achiever')

            fireEvent.click(screen.getByText(submitFormButtonText));

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
            expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestUtils.space, expectedPerson, ['Low Achiever']);
        });

        it('should not create person with empty value and display proper error message', async () => {
            const createPersonButton = screen.getByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.change(screen.getByLabelText('Name'), {target: {value: ''}});
            fireEvent.click(screen.getByText(submitFormButtonText));

            await waitFor(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(0);
            });

            expect(screen.getByText('Please enter a person name.')).toBeInTheDocument();
        });
    });

    describe('Roles', () => {
        const viewingDate: Date = new Date(2020, 5, 5)

        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(undefined, undefined, ({set}) => {
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
                        color: TestUtils.color2,
                    },
                };
                const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');
                expect(spy.mock.calls[0]).toEqual([TestUtils.space, expectedPerson, []]);
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
                const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');
                expect(spy.mock.calls[0]).toEqual([TestUtils.space, expectedPerson, []]);
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
                color: TestUtils.color1,
            },
            newPerson: true,
            newPersonDate: viewingDate,
        };

        const checkForCreatedPerson = async (): Promise<void> => {
            expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
            expect(PeopleClient.createPersonForSpace).toBeCalledWith(TestUtils.space, expectedPerson, []);

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                moment(viewingDate).format('YYYY-MM-DD'),
                [],
                TestUtils.space,
                expectedPerson
            );
        };

        it('assigns the person created by the PersonForm', async () => {
            await TestUtils.renderPeopleMoverComponent(undefined,undefined, ({set}) => {
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

    it('should have initially selected product selected', async () => {
        renderWithRedux(
            <RecoilRoot>
                <PersonForm
                    isEditPersonForm={false}
                    products={[]}
                    initialPersonName="BRADLEY"
                    initiallySelectedProduct={TestUtils.productWithAssignments}
                />
            </RecoilRoot>,
            undefined,
            initialState
        );
        await screen.findByText('Product 1');
    });

    it('should not show the unassigned product or archived products in product list', async () => {
        const products = [TestUtils.productWithAssignments, TestUtils.archivedProduct, TestUtils.unassignedProduct];
        renderWithRedux(
            <RecoilRoot>
                <PersonForm
                    isEditPersonForm={false}
                    products={products}
                    initialPersonName="BRADLEY"
                />
            </RecoilRoot>,
            undefined,
            initialState
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
        const products = [TestUtils.productWithAssignments, TestUtils.unassignedProduct];
        renderWithRedux(
            <RecoilRoot>
                <PersonForm
                    isEditPersonForm={false}
                    products={products}
                    initialPersonName="BRADLEY"
                />
            </RecoilRoot>,
            undefined,
            initialState
        );
        const productDropDown = screen.getByLabelText('Assign to');
        expect(screen.getByText('unassigned')).toBeDefined();
        await selectEvent.select(productDropDown, 'Product 1');

        expect(screen.queryByText('unassigned')).not.toBeInTheDocument();
    });

    describe('Editing people/assignments', () => {
        let originalWindow: Window;

        beforeEach(async () => {
            await TestUtils.renderPeopleMoverComponent(undefined,{
                currentSpace: TestUtils.space,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            }, ({set}) => {
                set(ViewingDateState, new Date(2019, 0, 1))
            })

            const editPersonButton = await screen.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonButton);

            originalWindow = window;
            window._paq = [];
        });

        afterEach(function() {
            (window as Window) = originalWindow;
        });

        it('should show Edit Person Modal when you click on edit person option', async () => {
            const editPersonButton = await screen.findByText('Edit Person');

            fireEvent.click(editPersonButton);

            await screen.findByText('Save');
        });

        describe('toggle placeholder from edit menu', () => {
            const markAsPlaceHolder = async (): Promise<void> => {
                await act(async () => {
                    const markAsPlaceholderButton = await screen.findByText('Mark as Placeholder');
                    fireEvent.click(markAsPlaceholderButton);
                });

                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'markAsPlaceholder', TestUtils.person1.name]);
            };

            it('should update an assignment to toggle placeholder when you click on Mark/Unmark as Placeholder option', async () => {
                await markAsPlaceHolder();

                let person1Card = await screen.findByTestId('assignmentCard__person_1');
                expect(person1Card).toHaveClass('Placeholder');

                expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                    TestUtils.originDateString,
                    [{
                        productId: TestUtils.productWithAssignments.id,
                        placeholder: true,
                    }],
                    TestUtils.space,
                    TestUtils.person1,
                    false
                );

                const editPersonButton = await screen.findByTestId('editPersonIconContainer__person_1');
                fireEvent.click(editPersonButton);

                const unmarkAsPlaceholderButton = await screen.findByText('Unmark as Placeholder');
                fireEvent.click(unmarkAsPlaceholderButton);

                person1Card = await screen.findByTestId('assignmentCard__person_1');
                expect(person1Card).toHaveClass('NotPlaceholder');
                expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                    TestUtils.originDateString,
                    [{
                        productId: TestUtils.productWithAssignments.id,
                        placeholder: false,
                    }],
                    TestUtils.space,
                    TestUtils.person1,
                    false
                );
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'unmarkAsPlaceholder', TestUtils.person1.name]);
            });
        });

        it('should cancel an assignment when you click on Cancel Assignment option', async () => {
            const cancelAssignmentButton = await screen.findByText('Cancel Assignment');

            fireEvent.click(cancelAssignmentButton);

            await waitFor(() => {
                expect(AssignmentClient.createAssignmentForDate).toBeCalledWith(
                    TestUtils.originDateString,
                    [],
                    TestUtils.space,
                    TestUtils.person1,
                    false
                );
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'cancelAssignment', TestUtils.person1.name]);
            });
        });
    });
});

describe('Deleting a Person', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await TestUtils.renderPeopleMoverComponent();
    });

    it('does not show the confirmation modal when the page loads', async () => {
        expect(screen.queryByText('Are you sure you want to delete')).toBeNull();
    });

    describe('click delete from edit person form', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByTestId('editPersonIconContainer__person_1'));
            fireEvent.click(screen.getByText('Edit Person'));
            await screen.findByText('Delete');
            fireEvent.click(screen.getByText('Delete'));
        });

        it('shows the confirmation modal when the delete button is clicked', async () => {
            await screen.findByText(/Are you sure?/i);
        });

        it('does not show the confirmation modal after the cancel button is clicked', async () => {
            fireEvent.click(screen.getByTestId('confirmationModalCancel'));
            await screen.findByText('Edit Person');

            expect(screen.queryByText(/Are you sure?/i)).toBeNull();
            await screen.findByText(/Edit Person/i);
        });

        it('does not show the confirmation modal after the delete button is clicked', async () => {
            await waitFor(() => {
                fireEvent.click(screen.getByTestId('confirmDeleteButton'));
            });

            expect(screen.queryByText(/Are you sure you want to delete/i)).toBeNull();
            expect(screen.queryByText(/Edit Person/i)).toBeNull();
        });
    });
});