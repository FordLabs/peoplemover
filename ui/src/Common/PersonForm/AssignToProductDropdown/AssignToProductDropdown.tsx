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

import React from "react";
import {isArchived} from "Services/PersonService";
import SelectWithNoCreateOption, {
    MetadataMultiSelectProps
} from "Common/SelectWithNoCreateOption/SelectWithNoCreateOption";
import {Product} from "Types/Product";
import {Person} from "Types/Person";
import {Option} from "../../../Types/Option";
import {isActiveProduct, isUnassignedProduct} from "../../../Services/ProductService";
import {useRecoilValue} from "recoil";
import {ProductsState} from "../../../State/ProductsState";
import {ViewingDateState} from "../../../State/ViewingDateState";

const { PERSON_ASSIGN_TO, ARCHIVED_PERSON_ASSIGN_TO } = MetadataMultiSelectProps;

interface Props {
    person: Person;
    selectedProducts: Product[]
    onChange(updatedProducts: Product[]): void;
}

function AssignToProductDropdown({ person, selectedProducts, onChange }: Props) {
    const products = useRecoilValue(ProductsState);
    const viewingDate = useRecoilValue(ViewingDateState);

    const alphabetize = (products: Array<Product>): void => {
        products.sort((product1: Product, product2: Product) => {
            return product1.name.toLowerCase().localeCompare(product2.name.toLowerCase());
        });
    };

    const getAssignToOptions = (): Array<Option> => {
        const filteredProducts: Array<Product> = products
            .filter(product => isActiveProduct(product, viewingDate) && !isUnassignedProduct(product));
        alphabetize(filteredProducts);
        return filteredProducts.map(selectable => {return {value: selectable.name, label: selectable.name};});
    };

    const getItemFromListWithName = (name: string, productsList: Array<Product>): Product | null => {
        const product = productsList.find(x => x.name === name);
        return product || null;
    };

    const changeProductName = (events: Array<{ value: string }>): void => {
        const updatedProducts: Array<Product> = [];
        (events || []).forEach(ev => {
            if (ev.value !== 'unassigned') {
                const product = getItemFromListWithName(ev.value, products);
                if (product) updatedProducts.push(product);
            }
        });
        onChange(updatedProducts.filter(product => product != null))
    };

    return (
        <SelectWithNoCreateOption
            metadata={isArchived(person, viewingDate) ? ARCHIVED_PERSON_ASSIGN_TO : PERSON_ASSIGN_TO}
            values={selectedProducts.map(x => {return {value:x.name, label:x.name};})}
            options={getAssignToOptions()}
            onChange={changeProductName}
        />
    )
}

export default AssignToProductDropdown;