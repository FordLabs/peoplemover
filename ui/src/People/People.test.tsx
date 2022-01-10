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
import {act, fireEvent, RenderResult, wait} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from '../People/PeopleClient';
import PersonForm from '../People/PersonForm';
import TestUtils, {renderWithRedux, renderWithReduxEnzyme} from '../tests/TestUtils';
import {createStore, PreloadedState, Store} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import selectEvent from 'react-select-event';
import {emptyPerson, Person} from './Person';
import {Product} from '../Products/Product';
import {Option} from '../CommonTypes/Option';
import moment from 'moment';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';
import {Router} from 'react-router-dom';
import {createBrowserHistory} from 'history';

declare let window: MatomoWindow;

function applicationSetup(store?: Store, initialState?: PreloadedState<GlobalStateProps>): RenderResult {
    let history = createBrowserHistory();
    history.push('/uuid');

    return renderWithRedux(
        <Router history={history}>
            <PeopleMover/>
        </Router>,
        undefined,
        initialState
    );
}

describe('People actions', () => {
    const initialState: PreloadedState<GlobalStateProps> = {currentSpace: TestUtils.space} as GlobalStateProps;
    const addPersonButtonText = 'Add Person';
    const addPersonModalTitle = 'Add New Person';
    const submitFormButtonText = 'Add';
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('Person Form', () => {
        let app: RenderResult;

        const initialState: PreloadedState<GlobalStateProps> = {
            people: TestUtils.people,
            viewingDate: new Date(2020, 5, 5),
            currentSpace: TestUtils.space,
            allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
        } as GlobalStateProps;

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await wait(() => {
                app = applicationSetup(undefined, initialState);
            });
        });

        it('opens PersonForm component in editing mode when hamburger icon is clicked', async () => {
            const editPersonIcon = await app.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonIcon);

            const editPersonButton = await app.findByText('Edit Person');
            fireEvent.click(editPersonButton);

            await app.findByText('Save');
        });

        it('opens PersonForm component when Add Person button is clicked', async () => {
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await app.findByText(addPersonModalTitle);
        });

        it('While editing, queries the Assignment Client on load for products this person is assigned to', async () => {
            const editPersonButton = await app.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonButton);

            await app.findByText('Edit Person');

            fireEvent.click(app.getByText('Edit Person'));

            const saveButton = await app.findByText('Save');
            fireEvent.click(saveButton);

            await wait(() => {
                expect(AssignmentClient.getAssignmentsUsingPersonIdAndDate)
                    .toBeCalledWith(
                        TestUtils.space.uuid,
                        TestUtils.person1.id,
                        new Date(2020, 5, 5)
                    );
            });
        });

        it('should show placeholder text for the person name', async () => {
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await app.findByPlaceholderText('e.g. Jane Smith');
        });

        it('should show placeholder text for the person cdsid', async () => {
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            await app.findByPlaceholderText('e.g. jsmith12');
        });

        it('should not submit assignment when nothing changed', async () => {
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.click(app.getByText(submitFormButtonText));

            await wait(() => {
                expect(AssignmentClient.createAssignmentForDate).not.toBeCalled();
            });
        });

        it('creates the person specified by the PersonForm', async () => {
            await act(async () => {
                fireEvent.click(await app.findByText(addPersonButtonText));
            });

            fireEvent.change(await app.getByLabelText('Name'), {target: {value: 'New Bobby'}});
            fireEvent.change(await app.getByLabelText('Role'), {target: {value: 'Software Engineer'}});
            fireEvent.change(await app.getByLabelText('CDSID'), {target: {value: 'btables1'}});
            fireEvent.click(await app.getByLabelText('Mark as New'));

            await act(async () => {
                await selectEvent.create(await app.findByLabelText('Person Tags'), 'Low Achiever');
            });

            fireEvent.click(app.getByText(submitFormButtonText));


            await wait(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'New Bobby',
                    customField1: 'btables1',
                    newPerson: true,
                    newPersonDate: initialState.viewingDate,
                    tags: [{
                        id: 1337,
                        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                        name: 'Low Achiever',
                    }],
                };
                const spy = jest.spyOn(PeopleClient, 'createPersonForSpace');

                expect(spy.mock.calls[0]).toEqual([TestUtils.space, expectedPerson, ['Low Achiever']]);
            });
        });

        it('should not create person with empty value and display proper error message', async () => {
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.change(app.getByLabelText('Name'), {target: {value: ''}});
            fireEvent.click(app.getByText(submitFormButtonText));

            await wait(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(0);
            });

            expect(await app.findByText('Please enter a person name.')).toBeInTheDocument();
        });
    });

    describe('Roles', () => {
        let app: RenderResult;

        const viewingDate = new Date(2020, 5, 5);

        const initialState: PreloadedState<GlobalStateProps> = {
            viewingDate: viewingDate,
        } as GlobalStateProps;

        beforeEach(async () => {
            await act(async () => {
                app = applicationSetup(undefined, initialState);

                const createPersonButton = await app.findByText(addPersonButtonText);
                fireEvent.click(createPersonButton);

                fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});
            });
        });

        it('allows choices of roles provided by the API', async () => {
            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await app.findByTestId('personForm')};
            await selectEvent.select(labelElement, /Product Manager/, containerToFindOptionsIn);

            fireEvent.click(app.getByLabelText('Mark as New'));

            fireEvent.click(app.getByText(submitFormButtonText));

            await wait(() => {
                expect(PeopleClient.createPersonForSpace).toBeCalledTimes(1);
                expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
                const expectedPerson: Person = {
                    ...emptyPerson(),
                    name: 'Some Name',
                    newPerson: true,
                    newPersonDate: initialState.viewingDate,
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
            const personForm = await app.findByTestId('personForm');
            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {
                container: personForm,
                createOptionText: TestUtils.expectedCreateOptionText('Product Owner'),
            };

            await wait(() => {
                selectEvent.create(labelElement, 'Product Owner', containerToFindOptionsIn);
            });

            expect(personForm).toHaveFormValues({role: 'Product Owner'});

            fireEvent.click(app.getByText(submitFormButtonText));

            await wait(() => {
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
            await app.findByText(addPersonButtonText);
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

        const initialState: PreloadedState<GlobalStateProps> = {
            viewingDate: viewingDate,
        } as GlobalStateProps;

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
            let history = createBrowserHistory();
            history.push('/uuid');
            const app = renderWithRedux(<Router history={history}><PeopleMover/></Router>, undefined, initialState);
            const createPersonButton = await app.findByText(addPersonButtonText);
            fireEvent.click(createPersonButton);

            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Some Name'}});

            const labelElement = await app.findByLabelText('Role');
            const containerToFindOptionsIn = {container: await app.findByTestId('personForm')};
            await selectEvent.select(labelElement, /Software Engineer/, containerToFindOptionsIn);

            await app.findByText('unassigned');

            fireEvent.click(app.getByLabelText('Mark as New'));

            fireEvent.click(app.getByText(submitFormButtonText));

            await wait(checkForCreatedPerson);
        });
    });

    it('should have initially selected product selected', async () => {
        const products: Product[] = [];
        const component = <PersonForm isEditPersonForm={false}
            products={products}
            initialPersonName="BRADLEY"
            initiallySelectedProduct={TestUtils.productWithAssignments}
        />;

        await act(async () => {
            const wrapper = await renderWithRedux(component, undefined, initialState);
            await wrapper.findByText('Product 1');
        });
    });

    it('should not show the unassigned product or archived products in product list', async () => {
        const products = [TestUtils.productWithAssignments, TestUtils.archivedProduct, TestUtils.unassignedProduct];
        const component = <PersonForm isEditPersonForm={false}
            products={products}
            initialPersonName="BRADLEY"/>;

        await act(async () => {
            const wrapper = await renderWithReduxEnzyme(component, undefined, initialState);

            const productSelect = await wrapper.find('Select');
            const selectProps: React.ComponentProps<typeof Object> = productSelect.at(1).instance().props;
            const options: Array<Option> = selectProps.options;

            expect(options.find(option => option.label === 'Product 1')).toBeTruthy();
            expect(options.find(option => option.label === 'I am archived')).toBeFalsy();
            expect(options.find(option => option.label === 'unassigned')).toBeFalsy();
        });
    });

    it('should remove the unassigned product when a product is selected from dropdown', async () => {
        const products = [TestUtils.productWithAssignments, TestUtils.unassignedProduct];
        const component = <PersonForm isEditPersonForm={false}
            products={products}
            initialPersonName="BRADLEY"/>;

        await act(async () => {
            const wrapper = await renderWithRedux(component, undefined, initialState);
            const productDropDown = await wrapper.findByLabelText('Assign to');
            await wrapper.findByText('unassigned');
            await selectEvent.select(productDropDown, 'Product 1');

            expect(wrapper.queryByText('unassigned')).not.toBeInTheDocument();
        });
    });

    it('should open the unassigned drawer from the Edit Person form when a person is edited into Unassigned product', async () => {
        const state = {people: TestUtils.people, currentSpace: TestUtils.space};
        const store = createStore(rootReducer, state);
        store.dispatch = jest.fn();

        const products = [TestUtils.unassignedProduct, TestUtils.productWithAssignments];
        const component = <PersonForm isEditPersonForm={true}
            products={products}
            personEdited={TestUtils.person1}
        />;

        await act(async () => {
            const wrapper = await renderWithReduxEnzyme(component, store);

            const selectDropdown = await wrapper.find('Select');
            const dropDown: React.ComponentProps<typeof Object> = selectDropdown.at(1).instance();
            dropDown.selectOption({label: 'unassigned', value: 'unassigned'});

            const saveButton = await wrapper.find('form');
            await wait(() => {
                saveButton.simulate('submit');
            });

            expect(store.dispatch).toHaveBeenCalledTimes(2);
        });
    });

    describe('Editing people/assignments', () => {
        let app: RenderResult;

        let originalWindow: Window;

        beforeEach(async () => {
            let history = createBrowserHistory();
            history.push('/uuid');
            const initialState: PreloadedState<GlobalStateProps> = {
                viewingDate: new Date(2019, 0, 1),
                currentSpace: TestUtils.space,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            } as GlobalStateProps;
            app = renderWithRedux(<Router history={history}><PeopleMover/></Router>, undefined, initialState);

            const editPersonButton = await app.findByTestId('editPersonIconContainer__person_1');
            fireEvent.click(editPersonButton);

            originalWindow = window;
            window._paq = [];
        });

        afterEach(function() {
            (window as Window) = originalWindow;
        });

        it('should show Edit Person Modal when you click on edit person option', async () => {
            const editPersonButton = await app.findByText('Edit Person');

            fireEvent.click(editPersonButton);

            await app.findByText('Save');
        });

        describe('toggle placeholder from edit menu', () => {
            const markAsPlaceHolder = async (): Promise<void> => {
                await act(async () => {
                    const markAsPlaceholderButton = await app.findByText('Mark as Placeholder');
                    fireEvent.click(markAsPlaceholderButton);
                });

                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'markAsPlaceholder', TestUtils.person1.name]);
            };

            it('should update an assignment to toggle placeholder when you click on Mark/Unmark as Placeholder option', async () => {
                await markAsPlaceHolder();

                let person1Card = await app.findByTestId('assignmentCard__person_1');
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

                const editPersonButton = await app.findByTestId('editPersonIconContainer__person_1');
                fireEvent.click(editPersonButton);

                const unmarkAsPlaceholderButton = await app.findByText('Unmark as Placeholder');
                fireEvent.click(unmarkAsPlaceholderButton);

                person1Card = await app.findByTestId('assignmentCard__person_1');
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
            const cancelAssignmentButton = await app.findByText('Cancel Assignment');

            fireEvent.click(cancelAssignmentButton);

            await wait(() => {
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

    describe('Bulk Import Form', () => {
        let app: RenderResult;

        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await wait(() => {
                app = applicationSetup(undefined, initialState);
            });
        });

        it('opens BulkImportForm component when Bulk Import button is clicked', async () => {
            const bulkImportButton = await app.findByText('Import people from CSV file');
            fireEvent.click(bulkImportButton);

            await app.findByText('Bulk Import');
        });
    });
});

describe('Deleting a Person', () => {
    let app: RenderResult;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        await wait(() => {
            app = applicationSetup();
        });
    });

    it('does not show the confirmation modal when the page loads', async () => {
        expect(app.queryByText('Are you sure you want to delete')).toBeNull();
    });

    describe('click delete from edit person form', () => {
        beforeEach(async () => {
            fireEvent.click(app.getByTestId('editPersonIconContainer__person_1'));
            fireEvent.click(app.getByText('Edit Person'));
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

        it('does not show the confirmation modal after the delete button is clicked', async () => {
            await wait(() => {
                fireEvent.click(app.getByTestId('confirmDeleteButton'));
            });

            expect(app.queryByText(/Are you sure you want to delete/i)).toBeNull();
            expect(app.queryByText(/Edit Person/i)).toBeNull();
        });
    });
});
