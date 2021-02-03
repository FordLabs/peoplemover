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

import DatePicker from 'react-datepicker';
import moment from 'moment';
import MaskedInput from 'react-text-mask';
import React, {PropsWithChildren, useState} from 'react';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {Product} from './Product';

interface Props {
    currentProduct: Product;
    updateProductField: (fieldName: string, fieldValue: string) => void;
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

    function handleKeyDownForOnClick(event: React.KeyboardEvent, callback: Function): void {
        if (event.key === 'Enter') {
            callback();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomInput = ({ value, onClick, onChange }: React.PropsWithChildren<any>): JSX.Element => {
        return (
            <div onClick={onClick} onKeyDown={(e): void => handleKeyDownForOnClick(e, onClick)}>
                <MaskedInput
                    className="formInput formTextInput"
                    name="start"
                    id="start"
                    value={value}
                    onChange={onChange}
                    mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                    placeholder="MM/DD/YYYY"
                />
                <i className="material-icons calendar-icon">date_range</i>
            </div>
        );
    };

    const DateInput = React.forwardRef(
        (props, ref) => <CustomInput innerRef={ref} {...props} />
    );

    return (
        <div className="formItem" data-testid="productFormStartDateField">
            <label className="formItemLabel" htmlFor="start">Start Date</label>
            <DatePicker
                selected={startDate}
                onChange={onStartDateChange}
                customInput={<DateInput />}
            />
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    viewingDate: moment(state.viewingDate).format('YYYY-MM-DD'),
});

export default connect(mapStateToProps)(ProductFormStartDateField);
/* eslint-enable */
