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

import React from 'react';
import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import PersonForm from '../People/PersonForm';
import TestUtils, {renderWithRedux, renderWithReduxEnzyme} from './TestUtils';
import {createStore, PreloadedState} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import selectEvent from 'react-select-event';
import {emptyPerson, Person} from '../People/Person';
import {Product} from '../Products/Product';
import {Assignment} from '../Assignments/Assignment';
import {Option} from '../CommonTypes/Option';
import {ThemeApplier} from '../ReusableComponents/ThemeApplier';
import {Color, SpaceRole} from '../Roles/Role';

describe('people actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('opens PersonForm component in editing mode when hambaga icon is clicked', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const editPersonIcon = await app.findByTestId('editPersonIconContainer-1');
        fireEvent.click(editPersonIcon);

        const editPersonButton = await app.findByText('Edit Person');
        fireEvent.mouseDown(editPersonButton);

        await app.findByText('Save');

        await wait(() => {
            expect(app.getByLabelText('Name')).toHaveFocus();
        });
    });

    it('opens PersonForm component when Add Person button is clicked', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        await app.findByText('Create New Person');
    });


    it('While editing, queries the Assignment Client on load for products this person is assigned to', async () => {
        const initialState: PreloadedState<GlobalStateProps> = {people: TestUtils.people} as GlobalStateProps;
        const app = renderWithRedux(<PeopleMover/>, undefined, initialState);

        const editPersonButton = await app.findByTestId('editPersonIconContainer-1');
        fireEvent.click(editPersonButton);

        await app.findByText('Edit Person');

        fireEvent.mouseDown(app.getByText('Edit Person'));
        fireEvent.mouseUp(app.getByText('Edit Person'));

        const saveButton = await app.findByText('Save');
        fireEvent.click(saveButton);

        await wait(() => {
            const spy = jest.spyOn(AssignmentClient, 'updateAssignmentsUsingIds');
            expect(spy).toBeCalledTimes(1);
            expect(spy.mock.calls[0]).toEqual([100, [1], [1]]);
        });
    });

    it('should show placeholder text for the person name', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        await app.findByPlaceholderText('e.g. Jane Smith');
    });

    it('submits unaltered assignment with default values', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        fireEvent.click(app.getByText('Create'));

        await wait(() => {
            expect(AssignmentClient.createAssignmentsUsingIds).toBeCalledTimes(0);
        });
    });

    it('creates the person specified by the PersonForm', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        fireEvent.change(app.getByLabelText('Name'), {target: {value: 'New Bobby'}});
        fireEvent.change(app.getByLabelText('Role'), {target: {value: 'Software Engineer'}});

        fireEvent.click(app.getByLabelText('Mark as New'));

        fireEvent.click(app.getByText('Create'));

        await wait(() => {
            expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
            const expectedPerson: Person = {
                ...emptyPerson(),
                name: 'New Bobby',
                newPerson: true,
            };
            const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');
            expect(spy.mock.calls[0]).toEqual([expectedPerson]);
        });
    });

    it('should not create person with empty value and display proper error message', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        fireEvent.change(app.getByLabelText('Name'), {target: {value: ''}});
        fireEvent.click(app.getByText('Create'));

        await wait(() => {
            expect(PeopleClient.createPersonForSpace).toBeCalledTimes(0);
        });

        expect(await app.findByText('Please enter a person name.')).toBeInTheDocument();
    });

    describe('roles', () => {
        let app: RenderResult;

        beforeEach(async () => {
            await act(async () => {
                app = renderWithRedux(<PeopleMover/>);

                const createPersonButton = await app.findByText('Add Person');
                fireEvent.click(createPersonButton);

                fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});
            });
        });

        it('allows choices of roles provided by the API', async () => {
            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await app.findByTestId('personForm')};
            await selectEvent.select(labelElement, /Product Manager/, containerToFindOptionsIn);

            fireEvent.click(app.getByLabelText('Mark as New'));

            fireEvent.click(app.getByText('Create'));

            await wait(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                expect(AssignmentClient.createAssignmentsUsingIds).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'Some Name',
                    newPerson: true,
                    spaceRole: {name: 'Product Manager', id: 2, spaceId: 1, color: {color: '2', id: 2}},
                };
                const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');
                expect(spy.mock.calls[0]).toEqual([expectedPerson]);
            });
        });

        it('allows user to create a new role when creating a person', async () => {
            const personForm = await app.findByTestId('personForm');
            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: personForm};
            await act(async () => {
                await selectEvent.create(labelElement, 'Product Owner', containerToFindOptionsIn);
            });

            expect(personForm).toHaveFormValues({role: 'Product Owner'});

            fireEvent.click(app.getByText('Create'));

            await wait(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                expect(AssignmentClient.createAssignmentsUsingIds).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'Some Name',
                    spaceRole: {name: 'Product Owner', id: 1, spaceId: -1, color: {color: '1', id: 2}},
                };
                const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');
                expect(spy.mock.calls[0]).toEqual([expectedPerson]);
            });
        });

        it('display placeholder text when you clear role field ', async () => {
            const placeholderText = 'Select or create a role';
            await app.findByText(placeholderText);

            const roleLabel = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await app.findByTestId('personForm')};
            await selectEvent.select(roleLabel, /Product Manager/, containerToFindOptionsIn);

            const personForm = await app.findByTestId('personForm');
            expect(personForm).toHaveFormValues({role: 'Product Manager'});
            expect(app.queryByText(placeholderText)).not.toBeInTheDocument();

            await selectEvent.clearFirst(roleLabel);
            await app.findByText(placeholderText);
        });

        it('should not submit form when you press ENTER key', async () => {
            const roleLabel = await app.findByLabelText('Role');
            fireEvent.change(roleLabel, {target: {value: 'Product Owner'}});

            fireEvent.keyDown(app.getByLabelText('Role'), {key: 'Enter', code: 13});
            await app.findByText('Product Owner');
            await app.findByText('Add Person');
        });
    });

    describe('creating person and assignments', () => {
        const expectedPerson: Person = {
            ...emptyPerson(),
            name: 'Some Name',
            spaceRole: {name: 'Software Engineer', id: 1, spaceId: 1, color: {color: '1', id: 1}},
            newPerson: true,
        };

        let app: RenderResult;

        const checkForCreatedPerson = async (): Promise<void> => {
            expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
            expect(PeopleClient.createPersonForSpace).toBeCalledWith(expectedPerson);

            const spy = jest.spyOn(AssignmentClient, 'createAssignmentsUsingIds');
            expect(spy).toBeCalledTimes(1);
            expect(spy.mock.calls[0]).toEqual([
                emptyPerson().id,
                [TestUtils.unassignedProduct.id]
            ]);
        };

        it('assigns the person created by the PersonForm', async () => {
            app = renderWithRedux(<PeopleMover/>);

            const createPersonButton = await app.findByText('Add Person');
            fireEvent.click(createPersonButton);

            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});

            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await app.findByTestId('personForm')};
            await selectEvent.select(labelElement, /Software Engineer/, containerToFindOptionsIn);


            await app.findByText('unassigned');

            fireEvent.click(app.getByLabelText('Mark as New'));

            fireEvent.click(app.getByText('Create'));

            await wait(checkForCreatedPerson);
        });
    });

    it('should have initially selected product selected', async () => {
        const products: Product[] = [];
        const component = <PersonForm editing={false}
            products={products}
            initialPersonName={'BRADLEY'}
            initiallySelectedProduct={TestUtils.productWithAssignments}
        />;

        await act(async () => {
            const wrapper = await renderWithRedux(component);
            await wrapper.findByText('Product 1');
        });
    });

    it('should not show the unassigned product or archived products in product list', async () => {
        const products = [TestUtils.productWithAssignments, TestUtils.archivedProduct, TestUtils.unassignedProduct];
        const component = <PersonForm editing={false}
            products={products}
            initialPersonName={'BRADLEY'}/>;

        await act(async () => {
            const wrapper = await renderWithReduxEnzyme(component);

            const productSelect = await wrapper.find('Select');
            const selectProps: any = productSelect.at(1).instance().props;
            const options: Array<Option> = selectProps.options;

            expect(options.find(option => option.label === 'Product 1')).toBeTruthy();
            expect(options.find(option => option.label === 'I am archived')).toBeFalsy();
            expect(options.find(option => option.label === 'unassigned')).toBeFalsy();
        });
    });

    it('should remove the unassigned product when a product is selected from dropdown', async () => {
        const products = [TestUtils.productWithAssignments, TestUtils.unassignedProduct];
        const component = <PersonForm editing={false}
            products={products}
            initialPersonName={'BRADLEY'}/>;

        await act(async () => {
            const wrapper = await renderWithRedux(component);
            const productDropDown = await wrapper.findByLabelText('Assign to');
            await wrapper.findByText('unassigned');
            await selectEvent.select(productDropDown, 'Product 1');

            expect(wrapper.queryByText('unassigned')).not.toBeInTheDocument();
        });
    });

    it('PersonForm allows choices of person names provided by the API', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        const nameList = await app.findByLabelText('Name');
        expect(nameList).toContainHTML('list="peopleList"');
    });

    it('should auto populate the role of the selected person name', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        await app.findByText('Create New Person');
        fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Person 1'}});
        expect(app.getByTestId('personForm')).toHaveFormValues({
            role: 'Software Engineer',
        });
    });

    it('should auto populate the notes of the selected person name', async () => {
        const app = renderWithRedux(<PeopleMover/>);

        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        await app.findByText('Create New Person');
        fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Person 1'}});
        expect((app.getByLabelText('Notes') as HTMLInputElement).value).toEqual('I love the theater');
    });

    it('displays new assignment when submitted, opening Unassigned drawer if needed', async () => {
        const app = renderWithRedux(<PeopleMover/>);
        const drawerCarets = await app.findAllByTestId('drawerCaret');
        const unassignedDrawerCaret = drawerCarets[0];
        fireEvent.click(unassignedDrawerCaret);

        expect(app.queryByText('John')).not.toBeInTheDocument();
        const createPersonButton = await app.findByText('Add Person');
        fireEvent.click(createPersonButton);

        await app.findByText('Create New Person');
        fireEvent.change(app.getByLabelText('Name'), {target: {value: 'John'}});
        fireEvent.change(app.getByLabelText('Role'), {target: {value: 'Software Engineer'}});

        const board: Board = {
            spaceId: 0,
            id: 1,
            name: 'board one',
            products: [
                {
                    boardId: 2,
                    productTags: [],
                    archived: false,
                    id: 999,
                    name: 'unassigned',
                    startDate: '',
                    endDate: '',
                    assignments: [
                        {
                            id: 2,
                            person: {
                                name: 'John',
                                spaceRole: {name: 'Software Engineer', spaceId: 0, id: 2},
                                newPerson: false,
                                id: 2,
                                spaceId: 0,
                            },
                            productId: 999,
                            placeholder: false,
                        },
                    ],
                },
            ],
        };
        (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve({data: [board]}));

        fireEvent.click(app.getByText('Create'));

        fireEvent.click(unassignedDrawerCaret);
        await app.findByText('John');
        expect(app.queryByText('Submit')).toBeNull();
    });

    it('should open the unassigned drawer from the Edit Person form when a person is edited into Unassigned product', async () => {
        (AssignmentClient.getAssignmentsUsingPersonId as Function) = jest.fn(() => Promise.resolve({
            data: [{
                productId: 1,
            }],
        }));

        const state = {people: TestUtils.people};
        const store = createStore(rootReducer, state);
        store.dispatch = jest.fn();

        const products = [TestUtils.unassignedProduct, TestUtils.productWithAssignments];
        const component = <PersonForm editing={true}
            products={products}
            assignment={TestUtils.assignmentForPerson1}
        />;

        await act(async () => {
            const wrapper = await renderWithReduxEnzyme(component, store);

            const selectDropdown = await wrapper.find('Select');
            const dropDown: any = selectDropdown.at(1).instance();
            dropDown.selectOption({label: 'unassigned', value: 'unassigned'});

            const saveButton = await wrapper.find('input[value=\'Save\']');
            await wait(() => {
                saveButton.simulate('click');
            });

            expect(store.dispatch).toHaveBeenCalledTimes(2);
        });
    });

    describe('editing people/assignments', () => {
        let app: RenderResult;

        beforeEach(async () => {
            app = renderWithRedux(<PeopleMover/>);
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            const reassignedDrawerCaret = drawerCarets[1];
            fireEvent.click(reassignedDrawerCaret);

            const editPersonButton = await app.findByTestId('editPersonIconContainer-1');
            fireEvent.click(editPersonButton);
        });

        function updateResponseForGetAllBoards(assignments: Array<Assignment>): void {
            const updatedProduct: Product = {
                boardId: 1,
                id: 1,
                name: 'Product 1',
                startDate: '1/1/11',
                endDate: '2/2/22',
                spaceLocation: {id: 23, name: 'Place', spaceId: 3},
                assignments: assignments,
                archived: false,
                productTags: [],
            };

            const updatedProducts: Array<Product> = [
                TestUtils.unassignedProduct,
                updatedProduct,
                TestUtils.productWithoutAssignments,
                TestUtils.archivedProduct,
            ];

            const updatedBoard: Board = {
                spaceId: 0,
                id: 1,
                name: 'board one',
                products: updatedProducts,
            };

            (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve({data: [updatedBoard]}));
        }

        it('should show Edit Person Modal when you click on edit person option', async () => {
            const editPersonButton = await app.findByText('Edit Person');

            fireEvent.mouseDown(editPersonButton);
            fireEvent.mouseUp(editPersonButton);

            await app.findByText('Save');
        });

        describe('toggle placeholder from edit menu', () => {
            const originalImpl = ThemeApplier.setBorderColorOnElement;

            beforeEach(() => {
                ThemeApplier.setBorderColorOnElement = jest.fn().mockImplementation();
            });

            afterEach(() => {
                ThemeApplier.setBorderColorOnElement = originalImpl;
            });

            it('should update an assignment to be a placeholder when you click on Mark as Placeholder option', async () => {
                const markAsPlaceholderButton = await app.findByText('Mark as Placeholder');

                fireEvent.mouseDown(markAsPlaceholderButton);
                fireEvent.mouseUp(markAsPlaceholderButton);

                const updatedAssignment: Assignment = {...TestUtils.assignmentForPerson1, placeholder: true};
                updateResponseForGetAllBoards([updatedAssignment]);

                const person1Card = await app.findByTestId('assignmentCard1');
                const person1role: SpaceRole = (TestUtils.people[0].spaceRole as SpaceRole);
                const person1RoleColor: Color = (person1role.color as Color);

                expect(ThemeApplier.setBorderColorOnElement).toHaveBeenCalledWith(
                    person1Card,
                    person1RoleColor.color
                );
            });

            it('should update an assignment to not be a placeholder when you click on Unmark as Placeholder option', async () => {
                const markAsPlaceholderButton = await app.findByText('Mark as Placeholder');
                fireEvent.mouseDown(markAsPlaceholderButton);
                fireEvent.mouseUp(markAsPlaceholderButton);

                const updatedAssignment: Assignment = {...TestUtils.assignmentForPerson1, placeholder: true};
                updateResponseForGetAllBoards([updatedAssignment]);

                const editPersonButton = await app.findByTestId('editPersonIconContainer-1');
                fireEvent.click(editPersonButton);

                const unmarkAsPlaceholderButton = await app.findByText('Unmark as Placeholder');
                fireEvent.mouseDown(unmarkAsPlaceholderButton);
                fireEvent.mouseUp(unmarkAsPlaceholderButton);

                updateResponseForGetAllBoards([{...updatedAssignment, placeholder: false}]);

                const person1Card = await app.findByTestId('assignmentCard1');
                expect(person1Card).toHaveClass('NotPlaceholder');
            });
        });

        it('should cancel an assignment when you click on Cancel Assignment option', async () => {
            const cancelAssignmentButton = await app.findByText('Cancel Assignment');

            fireEvent.mouseDown(cancelAssignmentButton);
            fireEvent.mouseUp(cancelAssignmentButton);

            updateResponseForGetAllBoards([]);

            await wait(() => {
                expect(app.queryByText('Person 1')).not.toBeInTheDocument();
            });
        });
    });
});

describe('Deleting a Person', () => {
    let app: RenderResult;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        app = renderWithRedux(<PeopleMover/>);
        await TestUtils.waitForHomePageToLoad(app);

        const drawerCarets = await app.findAllByTestId('drawerCaret');
        const reassignedDrawerCaret = drawerCarets[1];
        fireEvent.click(reassignedDrawerCaret);
    });

    it('does not show the confirmation modal when the page loads', async () => {
        expect(app.queryByText('Are you sure you want to delete')).toBeNull();
    });

    describe('click delete from edit person form', () => {
        beforeEach(async () => {
            fireEvent.click(app.getByTestId('editPersonIconContainer-1'));
            fireEvent.mouseDown(app.getByText('Edit Person'));
            fireEvent.mouseUp(app.getByText('Edit Person'));
            await app.findByText('Delete');
            fireEvent.click(app.getByText('Delete'));
        });

        it('shows the confirmation modal when the delete button is clicked', async () => {
            await app.findByText(/Are you sure?/i);
        });

        it('does not show the confirmation modal after the cancel button is clicked', async () => {
            fireEvent.click(app.getByTestId('confirmationModalCancel'));
            await app.findByText('Edit Person');

            expect(app.queryByText(/Are you sure?/i)).toBeNull();
            await app.findByText(/Edit Person/i);
        });

        it('sends delete request after the YES button is clicked', async () => {
            function updateResponseToRemovePersonAlsoDeletesAllAssignments(): void {
                const updatedProducts: Array<Product> = [{
                    ...TestUtils.productWithAssignments,
                    assignments: [],
                }];
                const updatedBoards: Array<Board> = [{
                    ...TestUtils.boards[0],
                    products: updatedProducts,
                }];
                (BoardClient.getAllBoards as Function) = jest.fn(() => Promise.resolve({data: updatedBoards}));
            }

            updateResponseToRemovePersonAlsoDeletesAllAssignments();

            fireEvent.click(app.getByTestId('confirmDeleteButton'));

            expect(PeopleClient.removePerson).toBeCalledTimes(1);

            await wait(() => {
                expect(app.queryByText('Person 1')).not.toBeInTheDocument();
            });
        });

        it('does not show the confirmation modal after the delete button is clicked', async () => {
            fireEvent.click(app.getByTestId('confirmDeleteButton'));

            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText(/Are you sure you want to delete/i)).toBeNull();
            expect(app.queryByText(/Delete/i)).toBeNull();
        });
    });
});
