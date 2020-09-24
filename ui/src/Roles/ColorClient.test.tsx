import Axios, {AxiosResponse} from 'axios';
import ColorClient from './ColorClient';
import Cookies from 'universal-cookie';

describe('Color Client', function() {
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };
    const cookies = new Cookies();

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get Products',
        } as AxiosResponse));
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should retrieve colors', function(done) {
        const expectedUrl = '/api/color';
        ColorClient.getAllColors().then(() => {
            expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
            done();
        });
    });
});
