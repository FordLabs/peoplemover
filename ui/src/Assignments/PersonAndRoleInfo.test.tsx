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
import TestUtils, {renderWithRedux} from '../Utils/TestUtils';
import PersonAndRoleInfo from './PersonAndRoleInfo';
import {fireEvent, RenderResult} from '@testing-library/react';
import {createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import moment from 'moment';

describe('the tooltip behavior on hover', () => {

    const getItemAndFireMouseOverEvent = async (renderResult: RenderResult, item: string): Promise<void> => {
        fireEvent.mouseOver(renderResult.getByTestId(item));
    };

    it('should show the notes of the person being hovered over', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: false});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.hank}
            isUnassignedProduct={false}
            duration={parseInt('dontcare', 1)}/>, store);
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        expect(app.queryByTestId('note-icon')).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.getByText('Notes:')).toBeInTheDocument();
        expect(app.getByTestId('note-icon')).toBeInTheDocument();
        expect(app.getByText("Don't forget the WD-40!")).toBeInTheDocument();
    });

    it('should not show the notes of the person being hovered over if they have none', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: false});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.person2}
            isUnassignedProduct={false}
            duration={parseInt('dontcare', 1)}/>, store);
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.queryByText('Notes:')).not.toBeInTheDocument();
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });

    it('should show the time on product of the person being hovered over', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: false, viewingDate: moment('2021-01-01').toDate()});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.hank}
            isUnassignedProduct={false}
            duration={367}/>, store);
        expect(app.queryByText('Time on Product:')).not.toBeInTheDocument();
        expect(app.queryByText('367 Days')).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.getByText('Time on Product:')).toBeInTheDocument();
        expect(app.getByTestId('timer-icon')).toBeInTheDocument();
        expect(app.getByText('367 Days')).toBeInTheDocument();
    });

    it('should show the person tags of the person being hovered over', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: false});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.person2}
            isUnassignedProduct={false}
            duration={parseInt('dontcare', 1)}/>, store);
        expect(app.queryByText('Person Tags:')).not.toBeInTheDocument();
        expect(app.queryByTestId('local_offer-icon')).not.toBeInTheDocument();
        expect(app.queryByText('The lil boss, The big boss')).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.getByText('Person Tags:')).toBeInTheDocument();
        expect(app.getByTestId('local_offer-icon')).toBeInTheDocument();
        expect(app.getByText('The lil boss, The big boss')).toBeInTheDocument();
    });

    it('should not show the person tags of the person being hovered over if they have none', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: false});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.unassignedPerson}
            isUnassignedProduct={false}
            duration={parseInt('dontcare', 1)}/>, store);
        expect(app.queryByText('Person Tags:')).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.queryByText('Person Tags: ')).not.toBeInTheDocument();
    });

    it('should not show the hover if the space is read only', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space, isReadOnly: true});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.hank} duration={0}
            isUnassignedProduct={false}/>, store);
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.queryByText('Notes:')).not.toBeInTheDocument();
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });

    it('should not show the hover if it is part of the Unassigned product', async () => {
        const store = createStore(rootReducer, {currentSpace: TestUtils.space});
        const app = renderWithRedux(<PersonAndRoleInfo
            person={TestUtils.hank} duration={0}
            isUnassignedProduct={true}/>, store);
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
        await getItemAndFireMouseOverEvent(app, 'assignmentCardPersonInfo');
        expect(app.queryByText('Notes:')).not.toBeInTheDocument();
        expect(app.queryByText("Don't forget the WD-40!")).not.toBeInTheDocument();
    });
});
