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
import {Report} from './Report';
import fileDownload from 'js-file-download';
import {Parser} from 'json2csv';
import moment from 'moment';
import {getToken} from '../Auth/TokenProvider';
import MatomoEvents from '../Matomo/MatomoEvents';

const baseReportsUrl = '/api/reports';

class ReportClient {
    static async getReportsWithNames(spaceName: string, spaceUuid: string, date: Date): Promise<void> {
        const dateAsString = moment(date).format('YYYY-MM-DD');
        const url = `${baseReportsUrl}/people?spaceUuid=${spaceUuid}&requestedDate=${dateAsString}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
        };
        return Axios.get(url, config).then( response => {
            const jsonAsCsv = ReportClient.convertToCSV(response.data);
            const fileName = `${spaceName}_${date.toISOString().split('T')[0]}.csv`;
            fileDownload(jsonAsCsv, fileName);
            MatomoEvents.pushEvent(spaceName, 'downloadReport', dateAsString);
        }).catch(err => {
            MatomoEvents.pushEvent(spaceName, 'downloadReportError', dateAsString, err.code);
            Promise.reject(err);
        });
    }

    static convertToCSV(jsonData: Report[]): string {
        const fields = [
            {
                label: 'Product Name',
                value: 'productName',
            },
            {
                label: 'Product Location',
                value: 'productLocation',
            },
            {
                label: 'Product Tags',
                value: 'productTags',
            },
            {
                label: 'Person Name',
                value: 'personName',
            },
            {
                label: 'CDSID',
                value: 'customField1',
            },
            {
                label: 'Person Role',
                value: 'personRole',
            },
            {
                label: 'Person Note',
                value: 'personNote',
            },
            {
                label: 'Person Tags',
                value: 'personTags',
            },
        ];

        const json2csvParser = new Parser({ fields });
        return json2csvParser.parse(jsonData);
    }
}

export default ReportClient;
