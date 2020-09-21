import Axios, {AxiosResponse} from 'axios';
import Cookies from 'universal-cookie';
import {AccessTokenClient} from './AccessTokenClient';

describe('Access Token Client', function() {

    const cookies = new Cookies();
    let accessToken = '123456';
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Returned Result',
        } as AxiosResponse));
    });

    afterEach(() => {
        cookies.remove('accessToken');
    });

    it('should validate access token and return result', function(done) {
        const expectedUrl = '/api/access_token/validate';
        AccessTokenClient.validateAccessToken(accessToken)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl, { accessToken }, expectedConfig);
                expect(response.data).toBe('Returned Result');
                done();
            });
    });

    it('should check user has access to space and return result', function(done) {
        const expectedUrl = '/api/access_token/authenticate';
        const spaceUUID = 'spaceID';
        AccessTokenClient.userCanAccessSpace(accessToken, spaceUUID)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(expectedUrl,
                    {
                        accessToken: accessToken,
                        uuid: spaceUUID,
                    },
                    expectedConfig);
                expect(response.data).toBe('Returned Result');
                done();
            });
    });
});
