/*
 *
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

import {AvailableActions} from '../Actions';
import {ProductTag} from '../../ProductTag/ProductTag';
import sortTagsAlphabetically from '../../Tags/sortTagsAlphabetically';

const productTagsReducer = (state: Array<ProductTag> = [], action: {type: AvailableActions; productTags: Array<ProductTag>} ): Array<ProductTag> => {
    if (action.type === AvailableActions.SET_PRODUCT_TAGS) {
        const productTags = [...action.productTags];
        sortTagsAlphabetically(productTags);
        return productTags;
    } else {
        return state;
    }
};

export default productTagsReducer;
