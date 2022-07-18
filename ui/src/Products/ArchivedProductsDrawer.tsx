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

import React, {useState} from 'react';
import ArchivedProduct from './ArchivedProduct';
import {isArchivedOnDate} from './ProductService';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import {useRecoilValue} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {Product} from 'Types/Product';

import '../Styles/Main.scss';
import './ArchivedProductsDrawer.scss';

function ArchivedProductsDrawer(): JSX.Element {
    const products = useRecoilValue(ProductsState);
    const viewingDate = useRecoilValue(ViewingDateState);

    const [showDrawer, setShowDrawer] = useState(false);

    const getArchivedProducts = (): Array<Product> => {
        return products.filter(product => isArchivedOnDate(product, viewingDate));
    };

    return (
        <DrawerContainer drawerIcon="inbox"
            numberForCountBadge={getArchivedProducts().length}
            containerTitle="Archived Products"
            testId="archivedProductsDrawer"
            containee={(
                <div className="archivedProductListContainer">
                    {getArchivedProducts().map(product => {
                        return (
                            <div key={product.id}>
                                <ArchivedProduct product={product}/>
                            </div>
                        );
                    })}
                </div>
            )}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}/>
    );
}

export default ArchivedProductsDrawer;
