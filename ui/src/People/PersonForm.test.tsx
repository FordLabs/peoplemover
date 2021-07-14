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

import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import PersonForm from './PersonForm';
import configureStore from 'redux-mock-store';
import React from 'react';
import {fireEvent, RenderResult} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import selectEvent from 'react-select-event';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {TagRequest} from '../Tags/TagRequest.interface';
import AssignmentClient from '../Assignments/AssignmentClient';
import PeopleClient from './PeopleClient';
import {AxiosResponse} from 'axios';
import {emptyPerson, Person} from "./Person";

describe('Person Form', () => {
    const mayFourteen: Date = new Date(2020, 4, 14);

    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: TestUtils.space,
        viewingDate: mayFourteen,
        allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
    });
    let personForm: RenderResult;

    describe('Creating a new person', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();

            await act(async () => {
                personForm = renderWithRedux(
                    <PersonForm
                        isEditPersonForm={false}
                        products={TestUtils.products}
                    />, store);
            });
        });

        it('create new person tags when one is typed in which does not already exist', async () => {
            await act(async () => {
                const personTagsLabel = await personForm.findByLabelText('Person Tags');
                await selectEvent.create(personTagsLabel, 'Low Achiever');
                const expectedPersonTagAddRequest: TagRequest = {name: 'Low Achiever'};
                await expect(PersonTagClient.add).toHaveBeenCalledWith(expectedPersonTagAddRequest, TestUtils.space);
                let form = await personForm.findByTestId('personForm');
                expect(form).toHaveFormValues({personTags: '1337_Low Achiever'});
            });
        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            await act( async () => {
                fireEvent.change(personForm.getByLabelText('Name'), {target: {value: 'person'}});
                fireEvent.click(personForm.getByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await personForm.findByText('Add'));
            });

            const expectedPerson: Person =  {...emptyPerson(), name: 'person', newPerson: true, newPersonDate: mayFourteen} ;
            expect(PeopleClient.createPersonForSpace).toHaveBeenCalledWith(TestUtils.space, expectedPerson, []);
        });
    });

    describe('Editing an existing person', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act(async () => {
                personForm = await renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        initialPersonName={TestUtils.hank.name}
                        personEdited={TestUtils.hank}
                    />, store, undefined);
            });
        });

        it('display the person\'s existing tags when editing a person', async () => {
            await act(async () => {
                await personForm.findByText('The lil boss');
            });
        });

        it('should display assignment history text', async () => {
            await act(async () => {
                await personForm.findByText('View Assignment History');
            });
            await act(async () => {
                await personForm.findByText('Moved to Hanky Product on 01/01/2020');
            });
        });
    });

    describe('handleSubmit()', () => {
        it('should not call createAssignmentForDate when assignment not changed to a different product', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            await act( async () => {
                personForm = renderWithRedux(
                    <PersonForm
                        isEditPersonForm={true}
                        products={TestUtils.products}
                        initiallySelectedProduct={TestUtils.productForHank}
                        initialPersonName={TestUtils.hank.name}
                    />, store, undefined);
            });

            await act( async () => {
                fireEvent.click(await personForm.findByText('Save'));
            });

            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(0);

        });

        it('should call createAssignmentForDate when assignment has been deliberately changed to unassigned', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            PeopleClient.updatePerson = jest.fn(() => Promise.resolve({data: TestUtils.hank} as AxiosResponse));
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

            const removeProductButton = personForm.baseElement.getElementsByClassName('product__multi-value__remove');
            expect(removeProductButton.length).toEqual(1);
            fireEvent.click(removeProductButton[0]);

            await act( async () => {
                fireEvent.click(await personForm.findByText('Save'));
            });

            expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(1);

        });

        it('should update newPersonDate on person when newPerson field goes from unchecked to checked for edit person', async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
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

            await act( async () => {
                fireEvent.click(await personForm.findByTestId('personFormIsNewCheckbox'));
                fireEvent.click(await personForm.findByText('Save'));
            });

            const expectedPerson: Person =  {...TestUtils.hank, newPerson: true, newPersonDate: mayFourteen} ;
            expect(PeopleClient.updatePerson).toHaveBeenCalledWith(TestUtils.space, expectedPerson, []);
        });
    });
});
