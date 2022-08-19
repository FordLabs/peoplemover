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

import { render, screen } from '@testing-library/react';
import SelectWithNoCreateOption from './SelectWithNoCreateOption';
import React from 'react';
import TestData from 'Utils/TestData';
import { noop } from '@babel/types';
import selectEvent from 'react-select-event';
import { Product } from 'Types/Product';

describe('SelectWithNoCreateOption (Multi-select)', () => {
    const initiallySelectedProducts: Product[] = [
        TestData.products[0],
        TestData.products[1],
    ];

    it('should render initial select options', () => {
        render(
            <SelectWithNoCreateOption
                metadata={{
                    title: 'Title',
                    id: 'product',
                    placeholder: 'Select a product',
                }}
                values={initiallySelectedProducts.map((x) => {
                    return { value: x.name, label: x.name };
                })}
                options={TestData.products.map((x) => {
                    return { value: x.name, label: x.name };
                })}
                onChange={noop}
            />
        );
        expect(
            screen.getByText(initiallySelectedProducts[0].name)
        ).toBeInTheDocument();
        expect(
            screen.getByText(initiallySelectedProducts[1].name)
        ).toBeInTheDocument();
        expect(
            screen.queryByText(TestData.products[2].name)
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(TestData.products[3].name)
        ).not.toBeInTheDocument();
    });

    it('should call the onChange callback when user selects new option', async () => {
        const mockOnChange = jest.fn();

        render(
            <SelectWithNoCreateOption
                metadata={{
                    title: 'Title',
                    id: 'product',
                    placeholder: 'Select a product',
                }}
                values={initiallySelectedProducts.map((x) => ({
                    value: x.name,
                    label: x.name,
                }))}
                options={TestData.products.map((x) => ({
                    value: x.name,
                    label: x.name,
                }))}
                onChange={mockOnChange}
            />
        );

        const SelectElement = screen.getByLabelText('Title');
        await selectEvent.select(SelectElement, [TestData.productForHank.name]);
        expect(mockOnChange).toHaveBeenCalled();
    });

    it('should render placeholder text no options are selected', () => {
        render(
            <SelectWithNoCreateOption
                metadata={{
                    title: 'Title',
                    id: 'product',
                    placeholder: 'Select a product',
                }}
                values={[]}
                options={TestData.products.map((x) => {
                    return { value: x.name, label: x.name };
                })}
                onChange={noop}
            />
        );

        expect(screen.getByText('Select a product')).toBeInTheDocument();
    });

    it('should custom up and down arrows', async () => {
        render(
            <SelectWithNoCreateOption
                metadata={{
                    title: 'Title',
                    id: 'product',
                    placeholder: 'Select a product',
                }}
                values={initiallySelectedProducts.map((x) => {
                    return { value: x.name, label: x.name };
                })}
                options={TestData.products.map((x) => {
                    return { value: x.name, label: x.name };
                })}
                onChange={noop}
            />
        );

        expect(screen.getByTestId('downArrow_product')).toBeDefined();
    });
});
