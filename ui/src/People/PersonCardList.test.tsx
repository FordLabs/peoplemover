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
import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import moment from 'moment';
import {GlobalStateProps} from '../Redux/Reducers';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {Product} from '../Products/Product';
import PersonCardList from "./PersonCardList";
import {RenderResult} from "@testing-library/react";
import {fireEvent} from "@testing-library/dom";

describe('Person Card List', () => {

    it('should open EditPersonModal when clicked', async () => {
        const app: RenderResult = renderWithRedux(<PersonCardList people={TestUtils.people}/>);
        const hank = await app.findByText('Hank');
        fireEvent.click(hank);
        expect(app.findByTestId('editMenu')).toBeInTheDocument();
    });

    let product: Product = {
        id: 1,
        name: 'Product 1',
        spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        startDate: '2011-01-01',
        endDate: '2022-02-02',
        spaceLocation: TestUtils.southfield,
        assignments: TestUtils.assignmentsFilterTest,
        archived: false,
        tags: [],
        notes: '',
    };

    describe('filtering person by role and person tag',  () => {

        it('should not filter people if no role or tag are selected', async () => {
            let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [],
                },
                {
                    label:'Role Tags:',
                    options: [{
                        label: 'Software Engineer',
                        value: '1_Software Engineer',
                        selected: false,
                    }],
                },
                {
                    label:'Person Tags:',
                    options: [{
                        label: 'The lil boss',
                        value: '1_The_lil_boss',
                        selected: false,
                    }],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                currentSpace: TestUtils.space,
            } as GlobalStateProps;

            let component = await renderWithRedux(<AssignmentCardList product={product}/>, undefined, initialState);

            await expect(component.queryByTestId('assignmentCard__person_1')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_se')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_pm')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_norole_notag')).toBeTruthy();

        });

        it('should filter people that do not have selected role', async () => {

            let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [],
                },
                {
                    label:'Role Tags:',
                    options: [{
                        label: 'Software Engineer',
                        value: '1_Software Engineer',
                        selected: true,
                    }],
                },
                {
                    label:'Person Tags:',
                    options: [{
                        label: 'The lil boss',
                        value: '1_The_lil_boss',
                        selected: false,
                    }],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                currentSpace: TestUtils.space,
            } as GlobalStateProps;

            let component = await renderWithRedux(<AssignmentCardList product={product}/>, undefined, initialState);

            await expect(component.queryByTestId('assignmentCard__person_1')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_se')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            await expect(component.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the person tag selected', async () => {
            let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [],
                },
                {
                    label:'Role Tags:',
                    options: [{
                        label: 'Software Engineer',
                        value: '1_Software Engineer',
                        selected: false,
                    }],
                },
                {
                    label:'Person Tags:',
                    options: [{
                        label: 'The lil boss',
                        value: '1_The_lil_boss',
                        selected: true,
                    }],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                currentSpace: TestUtils.space,
            } as GlobalStateProps;

            let component = await renderWithRedux(<AssignmentCardList product={product}/>, undefined, initialState);

            await expect(component.queryByTestId('assignmentCard__person_1')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_se')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_pm')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the role and person tag selected', async () => {
            let allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [],
                },
                {
                    label:'Role Tags:',
                    options: [{
                        label: 'Software Engineer',
                        value: '1_Software Engineer',
                        selected: true,
                    }],
                },
                {
                    label:'Person Tags:',
                    options: [{
                        label: 'The lil boss',
                        value: '1_The_lil_boss',
                        selected: true,
                    }],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                currentSpace: TestUtils.space,
            } as GlobalStateProps;

            let component = await renderWithRedux(<PersonCardList people={product}/>, undefined, initialState);

            await expect(component.queryByTestId('assignmentCard__person_1')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_se')).toBeTruthy();
            await expect(component.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            await expect(component.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });
    });
});

