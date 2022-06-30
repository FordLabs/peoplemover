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

import {
    AvailableActions,
    fetchLocationsAction,
    fetchPersonTagsAction,
    fetchProductTagsAction,
    setupSpaceAction,
} from './index';
import configureStore, {MockStoreCreator, MockStoreEnhanced} from 'redux-mock-store';
import TestData from '../../Utils/TestData';
import thunk from 'redux-thunk';
import * as filterConstants from '../../SortingAndFiltering/FilterLibraries';
import {AxiosResponse} from 'axios';
import LocationClient from '../../Locations/LocationClient';
import PersonTagClient from '../../Tags/PersonTag/PersonTagClient';
import ProductTagClient from '../../Tags/ProductTag/ProductTagClient';

describe('Actions', () => {
    let mockStore: MockStoreCreator<unknown, {}>;
    let store: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
        mockStore = configureStore([thunk]);
        store = mockStore({
            currentSpace: TestData.space,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setupSpaceAction', () => {
        it('should update the current space and filters', () => {
            const mock = jest.spyOn(filterConstants, 'getFilterOptionsForSpace');
            mock.mockResolvedValueOnce(TestData.allGroupedTagFilterOptions);

            const expectedActions = [
                {type: AvailableActions.SET_CURRENT_SPACE, space: TestData.space },
                {type: AvailableActions.SET_ALL_FILTER_OPTIONS, allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(setupSpaceAction(TestData.space)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchProductTagsAction', () => {
        it('should invoke ProductTagClient.get and fire the setProductTag Action', () => {
            const mock = jest.spyOn(ProductTagClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestData.productTags} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_PRODUCT_TAGS, productTags: TestData.productTags},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchProductTagsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestData.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchPersonTagsAction', () => {
        it('should invoke PersonTagClient.get and fire the setPersonTags Action', () => {
            const mock = jest.spyOn(PersonTagClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestData.personTags} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_PERSON_TAGS, personTags: TestData.personTags},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchPersonTagsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestData.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });

    describe('fetchLocationsAction', () => {
        it('should invoke LocationClient.get and fire the setLocations Action', () => {
            const mock = jest.spyOn(LocationClient, 'get');
            mock.mockReturnValueOnce(Promise.resolve({data: TestData.locations} as AxiosResponse));

            const expectedActions = [
                {type: AvailableActions.SET_LOCATIONS, locations: TestData.locations},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(fetchLocationsAction()).then(() => {
                expect(mock).toHaveBeenCalledTimes(1);
                expect(mock).toHaveBeenCalledWith(TestData.space.uuid);
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });
});
