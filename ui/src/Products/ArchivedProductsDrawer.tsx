/*
 * Copyright (c) 2021 Ford Motor Company
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
import '../Styles/Main.scss';
import './ArchivedProductsDrawer.scss';
import ArchivedProduct from './ArchivedProduct';
import {isArchivedOnDate, Product} from './Product';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';

interface ArchivedProductsDrawerProps{
    products: Array<Product>;
    viewingDate: Date;
}

function ArchivedProductsDrawer({products, viewingDate}: ArchivedProductsDrawerProps): JSX.Element {
    const [showDrawer, setShowDrawer] = useState(false);

    const getArchivedProducts = (): Array<Product> => {
        return products.filter(product => isArchivedOnDate(product, viewingDate));
    };

    const containee = <div className="archivedProductListContainer">
        {getArchivedProducts().map(product => {
            return (
                <div key={product.id}>
                    <ArchivedProduct product={product}/>
                </div>
            );
        })}
    </div>;
    return (
        <DrawerContainer drawerIcon="inbox"
            numberForCountBadge={getArchivedProducts().length}
            containerTitle="Archived Products"
            testId="archivedProductsDrawer"
            containee={containee}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}/>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    viewingDate: state.viewingDate,
});

export default connect(mapStateToProps)(ArchivedProductsDrawer);
/* eslint-enable */
