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

import React from 'react';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import ReportClient from '../Reports/ReportClient';
import {Space} from '../Space/Space';

interface Props {
    currentSpace: Space;
    viewingDate: Date;
}

function DownloadReportButton({ currentSpace, viewingDate }: Props): JSX.Element {
    const handleDownloadReport = async (): Promise<void> => {
        const { uuid, name } = currentSpace;
        if (uuid) await ReportClient.getReportsWithNames(name, uuid, viewingDate);
    };

    return (
        <button
            className="accountDropdownOption"
            role="menuitem"
            data-testid="downloadReport"
            onClick={handleDownloadReport}
        >
            Download Report
        </button>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
});

export default connect(mapStateToProps, {})(DownloadReportButton);
/* eslint-enable */
