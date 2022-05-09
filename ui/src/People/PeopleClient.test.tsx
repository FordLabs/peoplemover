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

import Axios from 'axios';
import PeopleClient from './PeopleClient';
import TestUtils from '../Utils/TestUtils';
import Cookies from 'universal-cookie';
import {Person} from './Person';
import {MatomoWindow} from '../CommonTypes/MatomoWindow';

jest.mock('axios');

declare let window: MatomoWindow;

describe('People Client', function() {
    const uuid = TestUtils.space.uuid || '';
    const basePeopleUrl = `/api/spaces/${uuid}/people`;
    const cookies = new Cookies();

    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn().mockResolvedValue({
            data: 'Created Person',
        });
        Axios.put = jest.fn().mockResolvedValue({
            data: 'Updated Person',
        });
        Axios.delete = jest.fn().mockResolvedValue({
            data: 'Deleted Person',
        });
        Axios.get = jest.fn().mockResolvedValue({
            data: 'Get All People',
        });
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should return all people for space', function(done) {
        PeopleClient.getAllPeopleInSpace(uuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(basePeopleUrl, expectedConfig);
                expect(response.data).toBe('Get All People');
                done();
            });

    });

    it('should create a person and return that person', function(done) {
        const newPerson = TestUtils.person1;
        PeopleClient.createPersonForSpace(TestUtils.space, newPerson, [])
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(basePeopleUrl, newPerson, expectedConfig);
                expect(response.data).toBe('Created Person');
                done();
            });
    });

    it('should edit a person and return that person', function(done) {
        const updatedPerson = TestUtils.person1;
        const expectedUrl = basePeopleUrl + `/${updatedPerson.id}`;
        PeopleClient.updatePerson(TestUtils.space, updatedPerson, [])
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, updatedPerson, expectedConfig);
                expect(response.data).toBe('Updated Person');
                done();
            });
    });

    it('should archive a person on today', function(done) {
        const archivedPerson = TestUtils.person1;
        const archiveDate = new Date(2020, 0, 2);
        const expectedUrl = basePeopleUrl + `/${archivedPerson.id}/archive`;
        PeopleClient.archivePerson(TestUtils.space, archivedPerson, archiveDate).then((response) => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, {archiveDate: archiveDate}, expectedConfig);
            done();
        });
    });

    it('should delete a person', function(done) {
        const expectedUrl = basePeopleUrl + `/${TestUtils.person1.id}`;
        PeopleClient.removePerson(uuid, TestUtils.person1.id)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Person');
                done();
            });
    });

    describe('Matomo', () => {
        let _paq: (string | number)[][];
        const expectedName = 'New Person';
        const person: Person = {
            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            id: -1,
            name: expectedName,
            spaceRole: TestUtils.softwareEngineer,
            newPerson: false,
            tags: [],
        };

        beforeEach(() => {
            _paq = window._paq

            Object.defineProperty(window, '_paq', {
                value: [],
                writable: true,
            });
        });

        afterEach(() => {
            window._paq = _paq
        });

        it('should send an event to matomo when a person is created', async () => {
            await PeopleClient.createPersonForSpace(TestUtils.space, person, ['bob']);
            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'addPerson', expectedName]);
            expect(window._paq).toContainEqual(['trackEvent', TestUtils.space.name, 'assignPersonTagToANewPerson', 'bob']);
        });
    });
});
