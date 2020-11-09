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

import React from 'react';
import './PersonDrawer.scss';
import './UnassignedDrawer.scss';
import {Product} from '../Products/Product';
import DrawerContainer from '../ReusableComponents/DrawerContainer';
import ProductCard from '../Products/ProductCard';

interface UnassignedDrawerProps {
    isUnassignedDrawerOpen: boolean;
    setIsUnassignedDrawerOpen(isOpen: boolean): void;
    product: Product;
}

function UnassignedDrawer({
    isUnassignedDrawerOpen,
    setIsUnassignedDrawerOpen,
    product,
}: UnassignedDrawerProps): JSX.Element {
    const containee =
        <ProductCard product={product}
            container={'productDrawerContainer'}/>;
    return (
        <DrawerContainer drawerIcon="fas fa-user-friends"
            testId="unassignedDrawer"
            numberForCountBadge={product.assignments ? product.assignments.length : 0}
            containerTitle="Unassigned"
            containee={containee}
            isDrawerOpen={isUnassignedDrawerOpen}
            setIsDrawerOpen={setIsUnassignedDrawerOpen}/>
    );
}

export default UnassignedDrawer;
