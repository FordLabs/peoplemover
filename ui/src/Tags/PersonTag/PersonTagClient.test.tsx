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

import Axios from 'axios';
import PersonTag from './PersonTagClient';
import TestData from '../../Utils/TestData';
import Cookies from 'universal-cookie';
import {MatomoWindow} from '../../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

describe('Person Tags Client', function() {
    const spaceUuid = TestData.space.uuid || '';
    const basePersonTagsUrl = `/api/spaces/${spaceUuid}/person-tags`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };
    const cookies = new Cookies();

    let originalWindow: MatomoWindow;

    beforeEach(() => {
        cookies.set('accessToken', '123456');

        Axios.post = jest.fn().mockResolvedValue({ data: 'Created Person Tag' });
        Axios.put = jest.fn().mockResolvedValue({ data: 'Updated Person Tag' });
        Axios.delete = jest.fn().mockResolvedValue({ data: 'Deleted Person Tag' });
        Axios.get = jest.fn().mockResolvedValue({ data: 'Get Person Tags' });

        originalWindow = window;
        window._paq = [];
    });

    afterEach(() => {
        cookies.remove('accessToken');
        window = originalWindow;
    });

    it('should return all person tags for space', function(done) {
        PersonTag.get(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(basePersonTagsUrl, expectedConfig);
                expect(response.data).toBe('Get Person Tags');
                done();
            });

    });

    it('should create a person tag, return that person tag, and send a `person tag created` event to Matomo', function(done) {
        const expectedPersonAddRequest = { name: TestData.personTag1.name };
        PersonTag.add(expectedPersonAddRequest, TestData.space)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(basePersonTagsUrl, expectedPersonAddRequest, expectedConfig);
                expect(window._paq).toContainEqual(['trackEvent', TestData.space.name, 'addPersonTag', TestData.personTag1.name]);
                expect(response.data).toBe('Created Person Tag');
                done();
            });
    });

    it('should edit a person tag and return that person tag', function(done) {
        const expectedPersonEditRequest = {
            id: TestData.personTag1.id,
            name: TestData.personTag1.name,
        };
        PersonTag.edit(expectedPersonEditRequest, TestData.space)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(`${basePersonTagsUrl}/${TestData.personTag1.id}`, expectedPersonEditRequest, expectedConfig);
                expect(response.data).toBe('Updated Person Tag');
                done();
            });
    });

    it('should delete a person tag', function(done) {
        const expectedUrl = `${basePersonTagsUrl}/${TestData.personTag1.id}`;
        PersonTag.delete(TestData.personTag1.id, TestData.space)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Person Tag');
                done();
            });
    });
});
