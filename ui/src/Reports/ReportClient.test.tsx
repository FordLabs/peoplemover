import Axios, {AxiosResponse} from 'axios';
import ReportClient from './ReportClient';
import Cookies from 'universal-cookie';
import fileDownload from 'js-file-download';
jest.mock('js-file-download');

describe('Report Client', function() {
    const baseUrl = `/api/reportgenerator`;
    const cookies = new Cookies();
    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(function() {
        cookies.set('accessToken', '123456');
        const response = [{
            productName: 'product',
            personName: 'person',
            personRole: 'role',
        }];
        Axios.get = jest.fn(x => Promise.resolve({data: response} as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should get get report with names', async () => {
        const spaceName = 'bob';
        const spaceUuid = 'spaceUuid';
        const today = new Date(2020, 8, 21);
        const expectedFilename = `bob_2020-09-21.csv`;
        const expectedJson = '"productName","personName","personRole"\n"product","person","role"';

        const expectedUrl = `${baseUrl}/spaceUuid/2020-09-21`;
        await ReportClient.getReportsWithNames(spaceName, spaceUuid, today);
        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
        expect(fileDownload).toHaveBeenCalledWith(expectedJson, expectedFilename);
    });

});
