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
import TestData from 'Utils/TestData';
import AssignmentCardList from './AssignmentCardList';
import moment from 'moment';
import {LocalStorageFilters} from 'SubHeader/SortingAndFiltering/FilterLibraries';
import {ViewingDateState} from 'State/ViewingDateState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {renderWithRecoil} from 'Utils/TestUtils';
import {Product} from 'Types/Product';

const product: Product = {
    id: 1,
    name: 'Product 1',
    spaceUuid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    startDate: '2011-01-01',
    endDate: '2022-02-02',
    spaceLocation: TestData.southfield,
    assignments: TestData.assignmentsFilterTest,
    archived: false,
    tags: [],
    notes: '',
};

jest.mock('Services/Api/AssignmentClient');

describe('Assignment card list', () => {
    describe('Filtering person by role and person tag',  () => {
        it('should not filter people if no role or tag are selected', async () => {
            setupAssignmentCardList();

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_pm')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_norole_notag')).toBeDefined();

        });

        it('should filter people that do not have selected role', async () => {
            setupAssignmentCardList({ roleFilters: ['Software Engineer'] });

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the person tag selected', async () => {
            setupAssignmentCardList({ personFilters: ['The lil boss'] });

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_pm')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });

        it('should filter people that do not have the role and person tag selected', async () => {
            setupAssignmentCardList({ roleFilters: ['Software Engineer'], personFilters: ['The lil boss'] });

            expect(screen.getByTestId('assignmentCard__person_1')).toBeDefined();
            expect(screen.getByTestId('assignmentCard__bob_se')).toBeDefined();
            expect(screen.queryByTestId('assignmentCard__bob_pm')).toBeNull();
            expect(screen.queryByTestId('assignmentCard__bob_norole_notag')).toBeNull();
        });
    });
});

const setupAssignmentCardList = ({ roleFilters = [], personFilters = [] }: { roleFilters?: string[]; personFilters?: string[]; } = {}) => {
    const selectedFilters: LocalStorageFilters = {
        locationTagFilters: [],
        productTagFilters: [],
        roleTagFilters: roleFilters,
        personTagFilters: personFilters,
    };
    localStorage.setItem('filters', JSON.stringify(selectedFilters));
    renderWithRecoil(
        <AssignmentCardList product={product}/>,
        ({set}) => {
            set(ViewingDateState, moment().toDate())
            set(CurrentSpaceState, TestData.space)
        }
    );
}

