/*
 * Copyright (c) 2022 Ford Motor Company
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
import InputMask from 'react-input-mask';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ViewingDateState } from 'State/ViewingDateState';
import { Product } from 'Types/Product';

interface Props {
    currentProduct: Product;
    updateProductField: (fieldName: string, fieldValue: string) => void;
}

function ProductFormStartDateField({
    currentProduct,
    updateProductField,
}: Props): JSX.Element {
    const viewingDate = useRecoilValue(ViewingDateState);

    const [startDate, setStartDate] = useState<Date>(
        currentProduct.startDate
            ? moment(currentProduct.startDate).toDate()
            : moment(viewingDate).toDate()
    );

    function onStartDateChange(date: Date): void {
        if (date) {
            setStartDate(date);
            updateProductField('startDate', moment(date).format('YYYY-MM-DD'));
        } else {
            setStartDate(moment(currentProduct.startDate).toDate());
            updateProductField(
                'startDate',
                moment(currentProduct.startDate).format('YYYY-MM-DD')
            );
        }
    }

    function handleKeyDownForOnClick(
        event: React.KeyboardEvent,
        callback: Function
    ): void {
        if (event.key === 'Enter') {
            callback();
        }
    }

    const CustomInput = ({
        value,
        onClick,
        onChange,
    }: // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.PropsWithChildren<any>): JSX.Element => {
        return (
            <div
                onClick={onClick}
                onKeyDown={(e): void => handleKeyDownForOnClick(e, onClick)}
            >
                <InputMask
                    className="formInput formTextInput"
                    name="start"
                    id="start"
                    mask={[
                        /\d/,
                        /\d/,
                        '/',
                        /\d/,
                        /\d/,
                        '/',
                        /\d/,
                        /\d/,
                        /\d/,
                        /\d/,
                    ]}
                    defaultValue={value}
                    placeholder="MM/DD/YYYY"
                    onChange={onChange}
                />
                <i className="material-icons calendar-icon">date_range</i>
            </div>
        );
    };

    const DateInput = React.forwardRef((props, ref) => (
        <CustomInput innerRef={ref} {...props} />
    ));

    return (
        <div className="formItem" data-testid="productFormStartDateField">
            <label className="formItemLabel" htmlFor="start">
                Start Date
            </label>
            <DatePicker
                selected={startDate}
                onChange={onStartDateChange}
                customInput={<DateInput />}
            />
        </div>
    );
}

export default ProductFormStartDateField;
