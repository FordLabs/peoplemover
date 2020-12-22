/*
 * Copyright (c) 2020 Ford Motor Company
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

import {Option} from '../CommonTypes/Option';
import {ProductTag} from '../ProductTag/ProductTag';
import {JSX} from '@babel/types';
import React, {useState} from 'react';
import {Product} from './Product';
import {Tag} from '../Tags/Tag.interface';
import {Space} from '../Space/Space';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {AxiosResponse} from 'axios';
import {GlobalStateProps} from '../Redux/Reducers';
import {connect} from 'react-redux';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';
import {TagRequest} from '../Tags/TagRequest.interface';
import ReactSelect from '../ModalFormComponents/ReactSelect';

interface Props {
    spaceId: number;
    loadingState: { isLoading: boolean; setIsLoading: (isLoading: boolean) => void };
    currentProductState: { currentProduct: Product };
    selectedProductTagsState: {
        selectedProductTags: Array<ProductTag>;
        setSelectedProductTags: (productTags: Array<ProductTag>) => void;
    };
    addGroupedTagFilterOptions: (tagFilterIndex: number, trait: Tag) => void;
    currentSpace: Space;
}

function ProductFormProductTagsField({
    spaceId,
    loadingState: {
        isLoading,
        setIsLoading,
    },
    currentProductState: {
        currentProduct,
    },
    selectedProductTagsState: {
        selectedProductTags,
        setSelectedProductTags,
    },
    currentSpace,
    addGroupedTagFilterOptions,
}: Props): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const uuid = currentSpace.uuid!;
    const [availableProductTags, setAvailableProductTags] = useState<Array<ProductTag>>([]);

    useOnLoad(() => {
        ProductTagClient.get(uuid).then(result => setAvailableProductTags(result.data));

        setSelectedProductTags(currentProduct.productTags);
    });

    function createTagOption(label: string, id: number): Option {
        return {
            label: label,
            value: id.toString() + '_' + label,
        };
    }

    function optionToProductTag(options: Array<Option>): Array<ProductTag> {
        if (!options) return [];

        return options.map(option => {
            return {
                id: Number.parseInt(option.value, 10),
                name: option.label,
                spaceId,
            };
        });
    }

    function handleCreateProductTag(inputValue: string): void {
        setIsLoading(true);
        const productTag: TagRequest = { name: inputValue };

        ProductTagClient.add(productTag, currentSpace)
            .then((response: AxiosResponse) => {
                const newProductTag: ProductTag = response.data;
                setAvailableProductTags(productTags => [...productTags, {
                    id: newProductTag.id,
                    name: newProductTag.name,
                }] as Array<ProductTag>);
                addGroupedTagFilterOptions(1, newProductTag as Tag);
                updateSelectedProductTags([...selectedProductTags, newProductTag]);
                setIsLoading(false);
            });
    }

    function updateSelectedProductTags(productTags: Array<ProductTag>): void {
        const selectedTags = (productTags.length > 0) ? [...productTags] : [];
        setSelectedProductTags(selectedTags);
    }

    const getOptions = (): Array<Option> => {
        return availableProductTags.map((productTag: ProductTag) => createTagOption(productTag.name, productTag.id));
    };

    const onChange = (option: unknown): void => updateSelectedProductTags(optionToProductTag(option as Option[]));

    return (
        <ReactSelect
            isMulti
            title="Product Tags"
            placeholder="product tags"
            id="productTags"
            values={selectedProductTags.map(
                productTag => createTagOption(productTag.name, productTag.id)
            )}
            options={getOptions()}
            onChange={onChange}
            onSave={handleCreateProductTag}
            isLoading={isLoading}
        />
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
});

export default connect(mapStateToProps)(ProductFormProductTagsField);
/* eslint-enable */
