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
import PeopleClient from './PeopleClient';
import TestData from '../../Utils/TestData';
import Cookies from 'universal-cookie';

jest.mock('axios');

describe('People Client', function() {
    const uuid = TestData.space.uuid || '';
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
        const newPerson = TestData.person1;
        PeopleClient.createPersonForSpace(TestData.space, newPerson)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(basePeopleUrl, newPerson, expectedConfig);
                expect(response.data).toBe('Created Person');
                done();
            });
    });

    it('should edit a person and return that person', function(done) {
        const updatedPerson = TestData.person1;
        const expectedUrl = basePeopleUrl + `/${updatedPerson.id}`;
        PeopleClient.updatePerson(TestData.space, updatedPerson)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, updatedPerson, expectedConfig);
                expect(response.data).toBe('Updated Person');
                done();
            });
    });

    it('should archive a person on today', function(done) {
        const archivedPerson = TestData.person1;
        const archiveDate = new Date(2020, 0, 2);
        const expectedUrl = basePeopleUrl + `/${archivedPerson.id}/archive`;
        PeopleClient.archivePerson(TestData.space, archivedPerson, archiveDate).then(() => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, {archiveDate: archiveDate}, expectedConfig);
            done();
        });
    });

    it('should delete a person', function(done) {
        const expectedUrl = basePeopleUrl + `/${TestData.person1.id}`;
        PeopleClient.removePerson(uuid, TestData.person1.id)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Person');
                done();
            });
    });
});
