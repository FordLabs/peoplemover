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
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {fireEvent} from '@testing-library/react';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';

describe('the tooltip behavior on hover', () => {
    it('should show the notes of the person being hovered over', async () => {
        let store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={TestUtils.assignmentForHank}
            isUnassignedProduct={false}/>, store);
        const theWholePersonAndRoleInfo = app.getByTestId('assignmentCard3info');
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        await fireEvent.mouseOver(theWholePersonAndRoleInfo);
        expect(app.getByText('Notes:')).toBeInTheDocument();
        expect(app.getByText("Don't forget the WD-40!")).toBeInTheDocument();
    });

    it('should not show the notes of the person being hovered over if they have none', async () => {
        let store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        let assignmentOfPersonWithNoNotes = TestUtils.assignmentForPerson2;
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={assignmentOfPersonWithNoNotes}
            isUnassignedProduct={false}/>, store);
        const theWholePersonAndRoleInfo = app.getByTestId('assignmentCard15info');
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        await fireEvent.mouseOver(theWholePersonAndRoleInfo);
        expect(app.queryByText('Notes:')).not.toBeInTheDocument();
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });

    it('should show the time on product of the person being hovered over', async () => {
        let store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={TestUtils.assignmentForHank}
            isUnassignedProduct={false}/>, store);
        const theWholePersonAndRoleInfo = app.getByTestId('assignmentCard3info');
        expect(app.queryByText('Time on Product:')).not.toBeInTheDocument();
        expect(app.queryByText('616 Days')).not.toBeInTheDocument();
        await fireEvent.mouseOver(theWholePersonAndRoleInfo);
        expect(app.getByText('Time on Product:')).toBeInTheDocument();
        expect(app.getByText('616 Days')).toBeInTheDocument();
    });

    it('should show the person tags of the person being hovered over', async () => {
        let store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={TestUtils.assignmentForPerson2}
            isUnassignedProduct={false}/>, store);
        const theWholePersonAndRoleInfo = app.getByTestId('assignmentCard15info');
        expect(app.queryByText('Person Tags:')).not.toBeInTheDocument();
        expect(app.queryByText('The lil boss, The big boss')).not.toBeInTheDocument();
        await fireEvent.mouseOver(theWholePersonAndRoleInfo);
        expect(app.getByText('Person Tags:')).toBeInTheDocument();
        expect(app.getByText('The lil boss, The big boss')).toBeInTheDocument();
    });

    it('should not show the person tags of the person being hovered over if they have none', async () => {
        let store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        let assignmentOfPersonWithNoTags = TestUtils.assignmentForUnassigned;
        let app = renderWithRedux(<PersonAndRoleInfo
            assignment={assignmentOfPersonWithNoTags}
            isUnassignedProduct={false}/>, store);
        const theWholePersonAndRoleInfo = app.getByTestId('assignmentCard11info');
        expect(app.queryByText('Person Tags:')).not.toBeInTheDocument();
        await fireEvent.mouseOver(theWholePersonAndRoleInfo);
        expect(app.queryByText('Person Tags: ')).not.toBeInTheDocument();
    });
});
