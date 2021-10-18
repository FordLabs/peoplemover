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

import {
    AvailableActions,
    fetchLocationsAction, fetchPeopleAction,
    fetchPersonTagsAction, fetchProductTagsAction,
    fetchRolesAction,
    setupSpaceAction,
} from '../Redux/Actions';
import configureStore, {MockStoreCreator, MockStoreEnhanced} from 'redux-mock-store';
import TestUtils from './TestUtils';
import thunk from 'redux-thunk';
import * as filterConstants from '../SortingAndFiltering/FilterLibraries';
import RoleClient from '../Roles/RoleClient';
import {AxiosResponse} from 'axios';
import LocationClient from '../Locations/LocationClient';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import PeopleClient from '../People/PeopleClient';


describe('Actions', () => {

    let mockStore: MockStoreCreator<unknown, {}>;
    let store: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
        mockStore = configureStore([thunk]);
        store = mockStore({
            currentSpace: TestUtils.space,
            viewingDate: new Date(2020, 4, 14),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setupSpaceAction', () => {
        it('should update the current space and filters', () => {
            const mock = jest.spyOn(filterConstants, 'getFilterOptionsForSpace');  // spy on otherFn
            mock.mockReturnValueOnce(Promise.resolve(TestUtils.allGroupedTagFilterOptions));  // mock the return value

            const expectedActions = [
                {type: AvailableActions.SET_CURRENT_SPACE, space: TestUtils.space },
                {type: AvailableActions.SET_ALL_FILTER_OPTIONS, allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(setupSpaceAction(TestUtils.space)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchProductTagsAction', () => {
        it('should invoke ProductTagClient.get and fire the setProductTag Action', () => {
            const mock = jest.spyOn(ProductTagClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestUtils.productTags} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_PRODUCT_TAGS, productTags: TestUtils.productTags},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchProductTagsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestUtils.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchPersonTagsAction', () => {
        it('should invoke PersonTagClient.get and fire the setPersonTags Action', () => {
            const mock = jest.spyOn(PersonTagClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestUtils.personTags} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_PERSON_TAGS, personTags: TestUtils.personTags},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchPersonTagsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestUtils.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchLocationsAction', () => {
        it('should invoke LocationClient.get and fire the setLocations Action', () => {
            const mock = jest.spyOn(LocationClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestUtils.locations} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_LOCATIONS, locations: TestUtils.locations},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchLocationsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestUtils.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchRolesAction', () => {
        it('should invoke RoleClient.get and fire the setRoles Action', () => {
            const mock = jest.spyOn(RoleClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestUtils.roles} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_ROLES, roles: TestUtils.roles},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchRolesAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestUtils.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchPeopleAction', () => {
        it('should invoke PeopleClient.getforspace and fire the setPeople action', () => {
            const mock = jest.spyOn(PeopleClient, 'getAllPeopleInSpace');
            mock.mockReturnValueOnce(Promise.resolve({data: TestUtils.people} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_PEOPLE, people: TestUtils.people},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchPeopleAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestUtils.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });
});
