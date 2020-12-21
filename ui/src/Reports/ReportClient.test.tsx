import Axios from 'axios';
import ReportClient from './ReportClient';
import Cookies from 'universal-cookie';
import fileDownload from 'js-file-download';

jest.mock('js-file-download');

describe('Report Client', function() {
    const baseReportsUrl = `/api/reports`;
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
            personNote: 'note',
        }];
        Axios.get = jest.fn().mockResolvedValue({data: response});
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should get get people report with names', async () => {
        const spaceName = 'bob';
        const spaceUuid = 'spaceUuid';
        const today = new Date(2020, 8, 21);
        const expectedFilename = `bob_2020-09-21.csv`;
        const expectedJson = '"Product Name","Person Name","Person Role","Person Note"\n"product","person","role","note"';

        const expectedUrl = `${baseReportsUrl}/people?spaceUuid=spaceUuid&requestedDate=2020-09-21`;
        await ReportClient.getReportsWithNames(spaceName, spaceUuid, today);
        expect(Axios.get).toHaveBeenCalledWith(expectedUrl, expectedConfig);
        expect(fileDownload).toHaveBeenCalledWith(expectedJson, expectedFilename);
    });
});
