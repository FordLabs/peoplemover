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

import React, {useCallback, useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {ProductTagsState} from '../../State/ProductTagsState';
import {FilterOption} from '../../Types/Option';
import {
    FilterTypeListings,
    getLocalStorageFiltersByType,
    productTagsFilterKey,
    setLocalStorageFiltersByType,
} from '../FilterLibraries';
import Filter from '../Filter';
import MyTagsForm from 'Tags/MyTagsForm';
import {ProductTag} from 'Types/Tags';

function ProductTagsFilter() {
    const productTags = useRecoilValue(ProductTagsState);

    const getFilterOptions = useCallback((): Array<FilterOption> => {
        const selectedRolesFromLocalStorage = getLocalStorageFiltersByType(productTagsFilterKey);
        return productTags.map((tag: ProductTag): FilterOption => ({
            label: tag.name,
            value: tag.id + '_' + tag.name,
            selected: selectedRolesFromLocalStorage.includes(tag.name),
        }));
    },[productTags])

    const [productTagFilterOptions, setProductTagFilterOptions] = useState<Array<FilterOption>>([]);

    useEffect(() => {
        setProductTagFilterOptions(getFilterOptions())
    }, [getFilterOptions, productTags])

    function setFilterOptions(options: FilterOption[]) {
        setLocalStorageFiltersByType(productTagsFilterKey, options);
        setProductTagFilterOptions(options);
    }

    return (
        <Filter
            label="Product Tags"
            defaultValues={productTagFilterOptions}
            onSelect={setFilterOptions}
            modalContents={{
                title: 'Product Tags',
                // @todo refactor my tags form
                component: <MyTagsForm filterType={FilterTypeListings.ProductTag}/>
            }}/>
    )
}

export default ProductTagsFilter;