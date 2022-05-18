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
import React from 'react';
import {screen} from '@testing-library/react';
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import AssignmentCardList from './AssignmentCardList';
import moment from 'moment';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {Product} from '../Products/Product';
import {RecoilRoot} from 'recoil';
import {ViewingDateState} from '../State/ViewingDateState';

const product: Product = {
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

describe('Assignment card list', () => {
    describe('Filtering person by role and person tag',  () => {
        it('should not filter people if no role or tag are selected', async () => {
            setupComponent(getAllGroupedTagFilterOptions(false, false));

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_pm')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_norole_notag')).toBeDefined();

        });

        it('should filter people that do not have selected role', async () => {
            setupComponent(getAllGroupedTagFilterOptions(true, false));

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the person tag selected', async () => {
            setupComponent(getAllGroupedTagFilterOptions(false, true));

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_pm')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the role and person tag selected', async () => {
            setupComponent(getAllGroupedTagFilterOptions(true, true));

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });
    });
});

const setupComponent = (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) => {
    renderWithRedux(
        <RecoilRoot initializeState={({set}) => {
            set(ViewingDateState, moment().toDate())
        }}>
            <AssignmentCardList product={product}/>
        </RecoilRoot>,
        undefined,
        {
            allGroupedTagFilterOptions: allGroupedTagFilterOptions,
            currentSpace: TestUtils.space,
        }
    );
}

const getAllGroupedTagFilterOptions = (roleTagIsSelected: boolean, personTagIsSelected: boolean): Array<AllGroupedTagFilterOptions> => {
    return [
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
                selected: roleTagIsSelected,
            }],
        },
        {
            label:'Person Tags:',
            options: [{
                label: 'The lil boss',
                value: '1_The_lil_boss',
                selected: personTagIsSelected,
            }],
        },
    ]
}

