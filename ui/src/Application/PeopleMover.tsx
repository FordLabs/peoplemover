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

import React, {useEffect, useState} from 'react';

import './Styleguide/Styleguide.scss';
import './PeopleMover.scss';

import ProductGraveyard from '../Products/ProductGraveyard';
import ProductList from '../Products/ProductList';
import Branding from '../ReusableComponents/Branding';
import CurrentModal from '../Redux/Containers/ModalContainer';
import UnassignedDrawerContainer from '../Redux/Containers/UnassignedDrawerContainer';
import {connect} from 'react-redux';
import {fetchProductsAction, setCurrentSpaceAction, setPeopleAction} from '../Redux/Actions';
import BoardSelectionTabs from '../Boards/BoardSelectionTabs';
import {GlobalStateProps} from '../Redux/Reducers';
import {CurrentModalState} from '../Redux/Reducers/currentModalReducer';
import {Person} from '../People/Person';
import PeopleClient from '../People/PeopleClient';
import Header from './Header';
import {Redirect} from 'react-router-dom';
import {Space} from '../SpaceDashboard/Space';
import SpaceClient from '../SpaceDashboard/SpaceClient';
import {Product} from '../Products/Product';

export interface PeopleMoverProps {
    currentModal: CurrentModalState;
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;

    fetchProducts(): Array<Product>;
    setCurrentSpace(space: Space): Space;
    setPeople(people: Array<Person>): Array<Person>;
}

function PeopleMover({
    currentModal,
    currentSpace,
    viewingDate,
    products,
    fetchProducts,
    setCurrentSpace,
    setPeople,
}: PeopleMoverProps): JSX.Element {
    const [redirect, setRedirect] = useState<JSX.Element>();

    function hasProducts() {
        return products && products.length > 0 && currentSpace;
    }

    useEffect(() => {
        RenderPage().then();
    }, [currentModal]);

    useEffect(() => {
        if(hasProducts()) fetchProducts();
    }, [viewingDate]);

    async function RenderPage(): Promise<void> {
        if (currentModal.modal === null) {
            try {
                const spaceName = window.location.pathname.replace('/', '');
                await SpaceClient.getSpaceFromName(spaceName)
                    .then(response => {
                        setCurrentSpace(response.data);
                    } );
                await fetchProducts();
                const peopleInSpace = (await PeopleClient.getAllPeopleInSpace()).data;

                setPeople(peopleInSpace);
            } catch (err) {
                setRedirect(<Redirect to="/error/404"/>);
            }
        }
    }

    if (redirect) {
        return redirect;
    }
    return (
        !hasProducts() ? <></> : <div className="App">
            <div className={currentModal.modal !== null ? 'noOverflow' : ''}>

                <Header/>

                <BoardSelectionTabs/>

                <div className="productAndAccordionContainer">
                    <ProductList/>
                    <div className="accordionContainer">
                        <div className="accordionHeaderContainer">
                            <UnassignedDrawerContainer/>
                            <ProductGraveyard products={products}/>
                        </div>
                    </div>
                </div>

                <CurrentModal/>

            </div>

            <Branding brand="FordLabs" message="Powered by"/>

        </div>
    );
}

const mapStateToProps = (state: GlobalStateProps) => ({
    currentModal: state.currentModal,
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    products: state.products,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
    setCurrentSpace: (space: Space) => dispatch(setCurrentSpaceAction(space)),
    setPeople: (people: Array<Person>) => dispatch(setPeopleAction(people)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleMover);