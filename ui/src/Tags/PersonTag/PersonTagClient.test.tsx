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

import Axios, {AxiosResponse} from 'axios';
import PersonTag from './PersonTagClient';
import TestUtils from '../../tests/TestUtils';
import Cookies from 'universal-cookie';
import {MatomoWindow} from '../../CommonTypes/MatomoWindow';

declare let window: MatomoWindow;

describe('Person Tags Client', function() {
    const spaceUuid = TestUtils.space.uuid;
    const basePersonTagsUrl = `/api/spaces/${spaceUuid}/person-tags`;
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };
    const cookies = new Cookies();

    let originalWindow: Window;

    beforeEach(() => {
        cookies.set('accessToken', '123456');

        // @ts-ignore
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Created Person Tag',
        } as AxiosResponse));
        // @ts-ignore
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Person Tag',
        } as AxiosResponse));
        // @ts-ignore
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Person Tag',
        } as AxiosResponse));
        // @ts-ignore
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Person Tags',
        } as AxiosResponse));

        originalWindow = window;
        window._paq = [];
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should return all person tags for space', function(done) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        PersonTag.get(spaceUuid!)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(basePersonTagsUrl, expectedConfig);
                expect(response.data).toBe('Get Person Tags');
                done();
            });

    });

    it('should create a person tag, return that person tag, and send a `person tag created` event to Matomo', function(done) {
        const expectedPersonAddRequest = { name: TestUtils.personTag1.name };
        PersonTag.add(expectedPersonAddRequest, TestUtils.space)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(basePersonTagsUrl, expectedPersonAddRequest, expectedConfig);
                expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'addPersonTag', TestUtils.personTag1.name]);
                expect(response.data).toBe('Created Person Tag');
                done();
            });
    });

    it('should edit a person tag and return that person tag', function(done) {
        const expectedPersonEditRequest = {
            id: TestUtils.personTag1.id,
            name: TestUtils.personTag1.name,
        };
        PersonTag.edit(expectedPersonEditRequest, TestUtils.space)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(`${basePersonTagsUrl}/${TestUtils.personTag1.id}`, expectedPersonEditRequest, expectedConfig);
                expect(response.data).toBe('Updated Person Tag');
                done();
            });
    });

    it('should delete a person tag', function(done) {
        const expectedUrl = `${basePersonTagsUrl}/${TestUtils.personTag1.id}`;
        PersonTag.delete(TestUtils.personTag1.id, TestUtils.space)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Person Tag');
                done();
            });
    });
});
