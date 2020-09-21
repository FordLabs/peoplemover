import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import LocationClient from './LocationClient';
import {TraitAddRequest} from '../Traits/TraitAddRequest';
import {TraitEditRequest} from '../Traits/TraitEditRequest';

describe('Location Client', function() {
    let originalWindow: Window;
    const baseUrl = `/api/location`;
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
        Axios.post = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({} as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({} as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
        (window as Window) = originalWindow;
    });

    it('should get locations for a space', function(done) {
        const expectedSpace = 'spaceUUID';
        const expectedUrl = `${baseUrl}/spaceUUID`;
        LocationClient.get(expectedSpace).then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });

    it('should add locations for a space', function(done) {
        const expectedSpace = 'spaceUUID';
        const expectedUrl = `${baseUrl}/spaceUUID`;
        const expectedRequest = { name: 'Name' } as TraitAddRequest;
        LocationClient.add(expectedRequest, expectedSpace).then(() => {
            expect(Axios.post).toHaveBeenCalledWith(expectedUrl, expectedRequest, expectedConfig);
            done();
        });
    });

    it('should edit locations for a space', function(done) {
        const expectedSpace = 'spaceUUID';
        const expectedUrl = `${baseUrl}/spaceUUID`;
        const expectedRequest = { id: 1, updatedName: 'Name' } as TraitEditRequest;
        LocationClient.edit(expectedRequest, expectedSpace).then(() => {
            expect(Axios.put).toHaveBeenCalledWith(expectedUrl, expectedRequest, expectedConfig);
            done();
        });
    });

    it('should delete locations for a space', function(done) {
        window.location = {pathname: '/spaceUUID'} as Location;
        const expectedUrl = `${baseUrl}/spaceUUID/1`;
        LocationClient.delete(1).then(() => {
            expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });
});
