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

import PeopleMover from '../Application/PeopleMover';
import {act, fireEvent, getByText, RenderResult, wait} from '@testing-library/react';
import React from 'react';
import AssignmentForm from '../Assignments/AssignmentForm';
import AssignmentClient from '../Assignments/AssignmentClient';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import TestUtils, {renderWithRedux, renderWithReduxEnzyme} from './TestUtils';
import {createStore, PreloadedState} from 'redux';
import {setIsUnassignedDrawerOpenAction} from '../Redux/Actions';
import selectEvent from 'react-select-event';
import {ThemeApplier} from '../ReusableComponents/ThemeApplier';
import {Color, SpaceRole} from '../Roles/Role';
import moment from "moment";

describe('AssignmentForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('in create mode', () => {
        const viewingDate = new Date(2020, 5,5);
        const initialState: PreloadedState<GlobalStateProps> = {
            viewingDate: viewingDate
        } as GlobalStateProps;

        async function openAssignPersonForm(app: RenderResult): Promise<void> {
            await TestUtils.waitForHomePageToLoad(app);
            fireEvent.click(app.getByTestId('addPersonToProductIcon-1'));
            await app.findByText('Assign to');
        }

        it('should not show the unassigned or archived products in the product list', async () => {
            await act(async () => {
                const products = [TestUtils.productWithAssignments, TestUtils.archivedProduct, TestUtils.unassignedProduct];
                const component = <AssignmentForm products={products}
                    initiallySelectedProduct={products[0]}/>;

                const app = renderWithReduxEnzyme(component);
                const productSelect = await app.find('Select#product');
                const options = (productSelect.instance().props as any).options;
                expect(options.find((option: any) => option.label === 'Product 1')).toBeTruthy();
                expect(options.find((option: any)  => option.label === 'I am archived')).toBeFalsy();
                expect(options.find((option: any)  => option.label === 'unassigned')).toBeFalsy();
            });
        });

        it('submits an assignment with the given person and product', async () => {
            const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
            await openAssignPersonForm(app);

            const labelElement = await app.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await app.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.click(app.getByText('Assign'));

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith({
                requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                person: TestUtils.person1,
                products: [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: TestUtils.assignmentForPerson1.placeholder,
                }],
            });
        });

        it('submits an assignment when the enter key is pressed', async () => {
            const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
            await openAssignPersonForm(app);

            const labelElement = await app.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await app.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.keyDown(app.getByText('Assign'), {key: 'Enter', code: 13});

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith({
                requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                person: TestUtils.person1,
                products: [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: TestUtils.assignmentForPerson1.placeholder,
                }],
            });
        });

        it('submits an assignment with the given placeholder status', async () => {
            const app = renderWithRedux(<PeopleMover/>, undefined, initialState);
            await openAssignPersonForm(app);

            const labelElement = await app.findByLabelText('Name');
            const containerToFindOptionsIn = { container: await app.findByTestId('assignmentForm') };
            await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

            fireEvent.click(app.getByLabelText('Mark as Placeholder'));
            fireEvent.click(app.getByText('Assign'));

            expect(AssignmentClient.createAssignmentForDate).toBeCalledTimes(1);
            expect(AssignmentClient.createAssignmentForDate).toBeCalledWith({
                requestedDate: moment(viewingDate).format('YYYY-MM-DD'),
                person: TestUtils.person1,
                products: [{
                    productId: TestUtils.assignmentForPerson1.productId,
                    placeholder: true,
                }],
            });
        });

        it('does not assign if person does not exist', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await openAssignPersonForm(app);
            await prefillReactSelectField(app, 'Name', 'John');
            fireEvent.click(app.getByText('Assign'));

            expect(AssignmentClient.createAssignmentForDate).not.toBeCalled();
        });

        it('does not assign if person field is empty', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await openAssignPersonForm(app);
            const labelElement = await app.findByLabelText('Name');
            fireEvent.change(labelElement, {target: {value: ''}});
            const assignButton = app.getByText('Assign');
            expect(assignButton.hasAttribute('disabled')).toBeTruthy();

            expect(AssignmentClient.createAssignmentForDate).not.toBeCalled();
        });

        it('is not dismissed if Assign is clicked with invalid person name', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await openAssignPersonForm(app);
            await prefillReactSelectField(app, 'Name', 'Bobberta');
            fireEvent.click(app.getByText('Assign'));
            await app.findByText('Assign to');
        });

        it('should populate dropdown to create new person with whatever is typed in input field', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await openAssignPersonForm(app);
            const labelElement = await app.findByLabelText('Name');
            fireEvent.change(labelElement, {target: {value: 'Barbara Jordan'}});
            await app.findByText('Create "Barbara Jordan"');
        });

        it('populates the person name field of the Create Person modal on open', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await openAssignPersonForm(app);

            await act(async () => {
                const labelElement = await app.findByLabelText('Name');
                await selectEvent.openMenu(labelElement);
                await prefillReactSelectField(app, 'Name', 'XYZ ABC 123');
                fireEvent.click(getByText(await app.findByTestId('assignmentForm'), 'Create "XYZ ABC 123"'));

                await app.findByText('Create New Person');

                const nameInputField: HTMLInputElement = app.getByLabelText('Name') as HTMLInputElement;
                expect(nameInputField.value).toEqual('XYZ ABC 123');
            });
        });

        it('should open the unassigned drawer when a person is assigned into it', async () => {
            const state = { people: TestUtils.people };
            const store = createStore(rootReducer, state);
            store.dispatch = jest.fn();

            await act(async () => {
                const component = <AssignmentForm
                    products={TestUtils.products}
                    initiallySelectedProduct={TestUtils.unassignedProduct}/>;
                const wrapper = await renderWithRedux(component, store);

                const labelElement = await wrapper.findByLabelText('Name');
                const containerToFindOptionsIn = { container: await wrapper.findByTestId('assignmentForm') };
                await selectEvent.select(labelElement, /Person 1/, containerToFindOptionsIn);

                const assignButton = await wrapper.findByText('Assign');
                fireEvent.click(assignButton);

            });

            await wait(() => {
                expect(store.dispatch).toHaveBeenCalledTimes(2);
                expect(store.dispatch).toHaveBeenCalledWith(
                    setIsUnassignedDrawerOpenAction(true)
                );
            });
        });

        describe('should render the appropriate role color', () => {

            const originalImpl = ThemeApplier.setBackgroundColorOnElement;

            beforeEach(() => {
                ThemeApplier.setBackgroundColorOnElement = jest.fn().mockImplementation();
            });

            afterEach(() => {
                ThemeApplier.setBackgroundColorOnElement = originalImpl;
            });

            it('should have role color banner next to name', async () => {
                const app = renderWithRedux(<PeopleMover/>);
                await openAssignPersonForm(app);

                const labelElement = await app.findByLabelText('Name');
                fireEvent.change(labelElement, {target: {value: 'Person 1'}});

                const person1ColorBadge = await app.findByTestId('RoleColorBadge');
                const person1Role: SpaceRole = (TestUtils.people[0].spaceRole as SpaceRole);
                const person1RoleColor: Color = (person1Role.color as Color);

                expect(ThemeApplier.setBackgroundColorOnElement).toHaveBeenCalledWith(
                    person1ColorBadge,
                    person1RoleColor.color
                );
            });
        });
    });
});

const prefillReactSelectField = async (app: RenderResult, label: string, prefillText: string): Promise<void> => {
    const labelElement = await app.findByLabelText(label);
    fireEvent.change(labelElement, {target: {value: prefillText}});
};