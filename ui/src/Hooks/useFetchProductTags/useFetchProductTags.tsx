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

import {useRecoilState} from 'recoil';
import {useCallback} from 'react';
import sortTagsAlphabetically from 'Utils/sortTagsAlphabetically';
import {RoleTag, Tag} from 'Types/Tag';
import {ProductTagsState} from 'State/ProductTagsState';
import ProductTagClient from 'Services/Api/ProductTagClient';

interface UseFetchProductTags {
    productTags: Tag[];
    fetchProductTags(): void
}

function useFetchProductTags(spaceUUID: string): UseFetchProductTags {
    const [productTags, setProductTags] = useRecoilState(ProductTagsState);

    const fetchProductTags = useCallback(() => {
        ProductTagClient.get(spaceUUID)
            .then(result => {
                const tags: Array<RoleTag> = [...result.data];
                sortTagsAlphabetically(tags);
                setProductTags(tags)
            })
            .catch(console.error);
    }, [setProductTags, spaceUUID])

    return {
        productTags: productTags || [],
        fetchProductTags
    };
}

export default useFetchProductTags;