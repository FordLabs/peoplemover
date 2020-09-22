import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import PeopleClient from './PeopleClient';
import {emptyPerson} from './Person';

describe('People Client', function() {
    let originalWindow: Window;
    const baseUrl = `/api/person`;
    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(function() {
        cookies.set('accessToken', '123456');
        originalWindow = window;
        delete window.location;
        window.location = {pathname: '/spaceUUID'} as Location;
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({} as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should get all people in a space', function(done) {
        const expectedUrl = `${baseUrl}/spaceUUID`;
        PeopleClient.getAllPeopleInSpace().then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });

    it('should add person to space', function(done) {
        const expectedUrl = `${baseUrl}/spaceUUID`;
        const expectedBody = emptyPerson();
        PeopleClient.createPersonForSpace(expectedBody).then(() => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedBody, expectedConfig);
            done();
        });
    });

    it('should update person', function(done) {
        const expectedBody = emptyPerson();
        PeopleClient.updatePerson(expectedBody).then(() => {
            expect(Axios.put).toHaveBeenCalledWith(baseUrl, expectedBody, expectedConfig);
            done();
        });
    });

    it('should remove person', function(done) {
        const expectedUrl = `${baseUrl}/1`;
        PeopleClient.removePerson(1).then(() => {
            expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });
});
