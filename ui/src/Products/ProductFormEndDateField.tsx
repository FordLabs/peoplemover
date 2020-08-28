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
import {Product} from './Product';

interface Props {
    currentProduct: Product;
    updateProductField: (fieldName: string, fieldValue: any) => void;
}

function ProductFormEndDateField({ currentProduct, updateProductField }: Props): JSX.Element {
    const [endDate, setEndDate] = useState<Date | null>(
        currentProduct.endDate ? moment(currentProduct.endDate).toDate() : null
    );

    const onChange = (date: Date): void => {
        setEndDate(date ? date : null);
        updateProductField('endDate', date ? moment(date).format('YYYY-MM-DD') : '');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CustomInput = ({ value, onClick, onChange }: any): JSX.Element => {
        return (
            <div onClick={onClick}>
                <MaskedInput
                    className="formInput formTextInput"
                    name="end"
                    id="end"
                    value={value}
                    onChange={onChange}
                    mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                    placeholder="MM/DD/YYYY"
                />
                {!endDate && <i className="far fa-calendar-alt calendar-icon" />}
            </div>
        );
    };

    const DateInput = React.forwardRef((props, ref) => <CustomInput innerRef={ref} {...props} />);

    return (
        <div className="formItem" data-testid="productFormNextPhaseDateField">
            <label className="formItemLabel" htmlFor="end">End Date</label>
            <DatePicker
                onChange={onChange}
                selected={endDate}
                customInput={<DateInput />}
                isClearable
            />
        </div>
    );
}

export default ProductFormEndDateField;
