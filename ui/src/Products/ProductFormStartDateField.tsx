/*
 * Copyright (c) 2019 Ford Motor Company
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

import DatePicker from 'react-datepicker';
import moment from 'moment';
import MaskedInput from 'react-text-mask';
import React, {useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Product} from './Product';

interface Props {
    currentProduct: Product;
    updateProductField: (fieldName: string, fieldValue: any) => void;
    viewingDate: string;
}

function ProductFormStartDateField({ currentProduct, viewingDate, updateProductField }: Props): JSX.Element {
    const [startDate, setStartDate] = useState<Date>(
        currentProduct.startDate ? moment(currentProduct.startDate).toDate() : moment(viewingDate).toDate()
    );

    function onStartDateChange(date: Date): void {
        if (date) {
            setStartDate(date);
            updateProductField('startDate', moment(date).format('YYYY-MM-DD'));
        } else {
            setStartDate(moment(currentProduct.startDate).toDate());
            updateProductField('startDate', moment(currentProduct.startDate).format('YYYY-MM-DD'));
        }
    }

    return (
        <div className="formItem" data-testid="productFormStartDateField">
            <label className="formItemLabel" htmlFor="start">Start Date</label>
            <DatePicker
                className="formInput formTextInput"
                name="start"
                id="start"
                selected={startDate}
                onChange={onStartDateChange}
                customInput={
                    <MaskedInput
                        mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                    />
                }
            />
            <i className="far fa-calendar-alt calendar-icon" />
        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    viewingDate: moment(state.viewingDate).format('YYYY-MM-DD'),
});

export default connect(mapStateToProps)(ProductFormStartDateField);