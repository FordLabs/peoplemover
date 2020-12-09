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

import React, {useCallback, useEffect, useState} from 'react';

import './Styleguide/Main.scss';
import './PeopleMover.scss';

import ProductGraveyard from '../Products/ProductGraveyard';
import ProductList from '../Products/ProductList';
import Branding from '../ReusableComponents/Branding';
import CurrentModal from '../Redux/Containers/ModalContainer';
import UnassignedDrawerContainer from '../Redux/Containers/UnassignedDrawerContainer';
import {connect} from 'react-redux';
import {
    fetchLocationsAction,
    fetchProductsAction,
    fetchProductTagsAction,
    setCurrentSpaceAction,
    setPeopleAction,
} from '../Redux/Actions';
import SpaceSelectionTabs from '../Header/SpaceSelectionTabs';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Person} from '../People/Person';
import PeopleClient from '../People/PeopleClient';
import Header from '../Header/Header';
import {Redirect} from 'react-router-dom';
import {Space} from '../Space/Space';
import SpaceClient from '../Space/SpaceClient';
import {Product} from '../Products/Product';
import ReassignedDrawer from '../ReassignedDrawer/ReassignedDrawer';
import {ProductTag} from '../ProductTag/ProductTag';
import {LocationTag} from '../Locations/LocationTag.interface';
import {AxiosError} from 'axios';

const BAD_REQUEST = 400;

export interface PeopleMoverProps {
    currentModal: CurrentModalState;
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;

    fetchProducts(): Array<Product>;
    fetchProductTags(): Array<ProductTag>;
    fetchLocations(): Array<LocationTag>;
    setCurrentSpace(space: Space): Space;
    setPeople(people: Array<Person>): Array<Person>;
}

function PeopleMover({
    currentModal,
    currentSpace,
    viewingDate,
    products,
    fetchProducts,
    fetchProductTags,
    fetchLocations,
    setCurrentSpace,
    setPeople,
}: PeopleMoverProps): JSX.Element {
    const [redirect, setRedirect] = useState<JSX.Element>();

    function hasProducts(): boolean {
        return Boolean(products && products.length > 0 && currentSpace);
    }

    const handleErrors = useCallback((error: AxiosError): Error | null => {
        if (error?.response?.status !== BAD_REQUEST) return error;
        setRedirect(<Redirect to="/error/404"/>);
        return null;
    }, []);

    useEffect(() => {
        const uuid = window.location.pathname.replace('/', '');
        if (currentModal.modal === null && uuid) {
            SpaceClient.getSpaceFromUuid(uuid)
                .then((response) => {
                    const space = response.data;
                    setCurrentSpace(space);
                    document.title = `${space.name} | PeopleMover`;
                })
                .catch(handleErrors);
        }
    }, [currentModal, setCurrentSpace, handleErrors]);

    useEffect(() => {
        if (currentSpace && currentSpace.uuid) {
            fetchProducts();
            fetchProductTags();
            fetchLocations();
            PeopleClient.getAllPeopleInSpace(currentSpace.uuid)
                .then((response) => {
                    const peopleInSpace = response.data;
                    setPeople(peopleInSpace);
                })
                .catch(handleErrors);
        }
    }, [
        currentSpace,
        setPeople,
        fetchProducts,
        fetchProductTags,
        fetchLocations,
        handleErrors,
    ]);

    /* eslint-disable */
    useEffect(() => {
        if (currentSpace && hasProducts()) fetchProducts();
    }, [viewingDate, currentSpace]);
    /* eslint-enable */

    if (redirect) {
        return redirect;
    }
    return (
        !hasProducts()
            ? <></>
            : <div className="App">
                <div>
                    <Header/>
                    <SpaceSelectionTabs/>
                    <div className="productAndAccordionContainer">
                        <ProductList/>
                        <div className="accordionContainer">
                            <div className="accordionHeaderContainer">
                                <UnassignedDrawerContainer/>
                                <ProductGraveyard/>
                                <ReassignedDrawer/>
                            </div>
                        </div>
                    </div>
                    <CurrentModal/>
                </div>
                <Branding brand="FordLabs" message="Powered by"/>
            </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentModal: state.currentModal,
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    products: state.products,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
    fetchProductTags: () => dispatch(fetchProductTagsAction()),
    fetchLocations: () => dispatch(fetchLocationsAction()),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
    setPeople: (people: Array<Person>) => dispatch(setPeopleAction(people)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleMover);
/* eslint-enable */
