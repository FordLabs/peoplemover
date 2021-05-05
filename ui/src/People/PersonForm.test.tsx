import TestUtils, {renderWithRedux} from '../tests/TestUtils';
import PersonForm from './PersonForm';
import configureStore from 'redux-mock-store';
import React from 'react';
import {RenderResult} from '@testing-library/react';
import {act} from 'react-dom/test-utils';
import selectEvent from 'react-select-event';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {TagRequest} from '../Tags/TagRequest.interface';

describe('Person Form', () => {
    window.location.hash = '#person-tags';

    const mockStore = configureStore([]);
    const store = mockStore({
        currentSpace: TestUtils.space,
        viewingDate: new Date(2020, 4, 14),
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
    });

    describe('Editing an existing person', () => {
        beforeEach(async () => {
            jest.clearAllMocks();
            TestUtils.mockClientCalls();
            personForm = await renderWithRedux(
                <PersonForm
                    isEditPersonForm={true}
                    products={TestUtils.products}
                    initiallySelectedProduct={TestUtils.productForHank}
                    initialPersonName={TestUtils.hank.name}
                    assignment={TestUtils.assignmentForHank}
                />, store, undefined);
        });
        it('display the person\'s existing tags when editing a person', async () => {
            await act(async () => {
                await personForm.findByText('The lil boss');
            });
        });
    });
});
