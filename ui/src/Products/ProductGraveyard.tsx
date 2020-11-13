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

import React, {useState} from 'react';
import '../Application/Styleguide/Main.scss';
import './ProductGraveyard.scss';
import ArchivedProduct from './ArchivedProduct';
import {Product} from './Product';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import {connect} from 'react-redux';
import {GlobalStateProps} from '../Redux/Reducers';
import moment from 'moment';

interface ProductGraveyardProps{
    products: Array<Product>;
    viewingDate: Date;
}

function ProductGraveyard({products, viewingDate}: ProductGraveyardProps): JSX.Element {
    const [showDrawer, setShowDrawer] = useState(false);

    const containee = <div className="archivedProductListContainer">
        {products.map(product => {
            if (product.archived || product.endDate! < moment(viewingDate).format('YYYY-MM-DD')) {
                return (
                    <div key={product.id}>
                        <ArchivedProduct product={product}/>
                    </div>
                );
            }
            return null;
        })}
    </div>;
    return (
        <DrawerContainer drawerIcon="inbox"
            containerTitle="Archived Products"
            containee={containee}
            isDrawerOpen={showDrawer}
            setIsDrawerOpen={setShowDrawer}/>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    products: state.products,
    viewingDate: state.viewingDate,
});

export default connect(mapStateToProps)(ProductGraveyard);
