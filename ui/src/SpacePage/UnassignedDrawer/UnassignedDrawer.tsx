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

import React from 'react';
import {stripAssignmentsForArchivedPeople} from 'Services/ProductService';
import DrawerContainer from 'Common/DrawerContainer/DrawerContainer';
import ProductCard from 'Common/ProductCard/ProductCard';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsUnassignedDrawerOpenState} from 'State/IsUnassignedDrawerOpenState';
import {UnassignedProductSelector} from 'State/ProductsState';

import 'Styles/PersonDrawer.scss';
import './UnassignedDrawer.scss';

function UnassignedDrawer(): JSX.Element {
    const unassignedProduct = useRecoilValue(UnassignedProductSelector);

    const viewingDate = useRecoilValue(ViewingDateState);
    const [isUnassignedDrawerOpen, setIsUnassignedDrawerOpen] = useRecoilState(IsUnassignedDrawerOpenState);

    const productWithoutArchivedPeople = stripAssignmentsForArchivedPeople(unassignedProduct, viewingDate);

    return (
        <DrawerContainer
            drawerIcon="supervisor_account"
            testId="unassignedDrawer"
            numberForCountBadge={productWithoutArchivedPeople.assignments ? productWithoutArchivedPeople.assignments.length : 0}
            containerTitle="Unassigned"
            containee={<ProductCard product={productWithoutArchivedPeople} />}
            isDrawerOpen={isUnassignedDrawerOpen}
            setIsDrawerOpen={setIsUnassignedDrawerOpen}/>
    );
}

export default UnassignedDrawer;