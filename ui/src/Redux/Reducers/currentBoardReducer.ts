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

import {AvailableActions} from '../Actions';
import {Product} from '../../Products/Product';

export function sortByProductName(productAName: string, productBName: string): number {
    return productAName.toLowerCase().localeCompare(productBName.toLowerCase());
}

function getSpaceLocationNameSafetly(product: Product): string {
    return product.spaceLocation ? product.spaceLocation.name : 'ZZZZZZZZ';
}

// export const currentBoardReducer = (
//     state: Board | null = null,
//     action: {type: AvailableActions; board: Board; sortOptionValue?: string}
// ): Board | null  => {
//
//     if (action.type === AvailableActions.SET_CURRENT_BOARD) {
//         if (action.sortOptionValue === 'location') {
//             const sortedProducts: Product[] = action.board.products.sort((productA: Product, productB: Product) => {
//                 const locationA = getSpaceLocationNameSafetly(productA);
//                 const locationB = getSpaceLocationNameSafetly(productB);
//
//                 const locationCompare = locationA.toLowerCase().localeCompare(locationB.toLowerCase());
//                 if (locationCompare === 0) {
//                     return sortByProductName(productA.name, productB.name);
//                 }
//                 return locationCompare;
//             });
//
//             const copiedState = {...action.board};
//             copiedState.products = sortedProducts;
//             return copiedState;
//
//         } else if (action.sortOptionValue === 'name') {
//             const sortedProducts: Product[] = action.board.products.sort((productA: Product, productB: Product) => {
//                 return sortByProductName(productA.name, productB.name);
//             });
//             const copiedState = {...action.board};
//             copiedState.products = sortedProducts;
//             return copiedState;
//         } else {
//             return {...action.board};
//         }
//     }
//     return state;
// };
