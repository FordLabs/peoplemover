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

import React, {useCallback, useEffect, useState} from 'react';

import './Styleguide/Main.scss';
import './PeopleMover.scss';

import ProductList from '../Products/ProductList';
import Branding from '../ReusableComponents/Branding';
import CurrentModal from '../Redux/Containers/CurrentModal';
import {connect} from 'react-redux';
import {
    fetchLocationsAction,
    fetchProductsAction,
    fetchProductTagsAction,
    fetchPersonTagsAction,
    setCurrentModalAction,
    setPeopleAction,
    setupSpaceAction,
} from '../Redux/Actions';

import SubHeader from '../Header/SubHeader';
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
import {Tag} from '../Tags/Tag';
import {LocationTag} from '../Locations/LocationTag.interface';
import UnassignedDrawer from '../Assignments/UnassignedDrawer';
import ArchivedProductsDrawer from '../Products/ArchivedProductsDrawer';
import {AxiosError} from 'axios';
import MatomoEvents from '../Matomo/MatomoEvents';
import {AvailableModals} from '../Modal/AvailableModals';
import Counter from '../ReusableComponents/Counter';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import AnnouncementBanner from '../Header/AnnouncementBanner';
import HeaderContainer from '../Header/HeaderContainer';

const BAD_REQUEST = 400;
const FORBIDDEN = 403;

export interface PeopleMoverProps {
    currentModal: CurrentModalState;
    currentSpace: Space;
    viewingDate: Date;
    products: Array<Product>;
    isReadOnly: boolean;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;

    fetchProducts(): Array<Product>;

    fetchProductTags(): Array<Tag>;

    fetchPersonTags(): Array<Tag>;

    fetchLocations(): Array<LocationTag>;

    setPeople(people: Array<Person>): Array<Person>;

    setCurrentModal(modalState: CurrentModalState): void;

    setSpace(space: Space): void;

}

function PeopleMover({
    currentModal,
    currentSpace,
    viewingDate,
    products,
    isReadOnly,
    allGroupedTagFilterOptions,
    fetchProducts,
    fetchProductTags,
    fetchPersonTags,
    fetchLocations,
    setSpace,
    setPeople,
    setCurrentModal,
}: PeopleMoverProps): JSX.Element {
    const [redirect, setRedirect] = useState<JSX.Element>();

    function hasProductsAndFilters(): boolean {
        return Boolean(products && products.length > 0 && currentSpace && allGroupedTagFilterOptions.length > 0);
    }

    const handleErrors = useCallback((error: AxiosError): Error | null => {
        if (error?.response?.status === BAD_REQUEST) {
            setRedirect(<Redirect to="/error/404"/>);
            return null;
        } else if (error?.response?.status === FORBIDDEN) {
            setRedirect(<Redirect to="/error/403"/>);
            return null;
        } else {
            return error;
        }
    }, []);

    useEffect(() => {
        if (currentSpace) {
            document.title = `${currentSpace.name} | PeopleMover`;
            if (isReadOnly) {
                MatomoEvents.pushEvent(currentSpace.name, 'viewOnlyVisit', '');
            }
        }
        return (): void => {
            document.title = 'PeopleMover';
        };
    }, [currentSpace, isReadOnly]);

    useEffect(() => {
        const uuid = window.location.pathname.replace('/', '');
        if (currentModal.modal === null && uuid) {
            SpaceClient.getSpaceFromUuid(uuid)
                .then((response) => {
                    const space = response.data;
                    setSpace(space);
                })
                .catch(handleErrors);
        }
    }, [currentModal, setSpace, handleErrors]);

    useEffect(() => {
        if (currentSpace && currentSpace.uuid) {
            fetchProducts();
            fetchProductTags();
            fetchPersonTags();
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
        fetchPersonTags,
        fetchLocations,
        handleErrors,
    ]);

    /* eslint-disable */
    useEffect(() => {
        if (currentSpace && hasProductsAndFilters()) fetchProducts();
    }, [viewingDate, currentSpace]);
    /* eslint-enable */

    if (redirect) {
        return redirect;
    }

    return (
        !hasProductsAndFilters()
            ? <></>
            : <div className="App">
                <a href="#main-content-landing-target" className="skipToProducts" data-testid="skipToContentLink">Skip to
                    main content</a>
                <HeaderContainer>
                    <AnnouncementBanner/>
                    <Header/>
                    <SubHeader/>
                </HeaderContainer>
                <main>
                    <div id="main-content-landing-target"/>
                    <Counter products={products} allGroupedTagFilterOptions={allGroupedTagFilterOptions}
                        viewingDate={viewingDate}/>
                    <div className="productAndAccordionContainer">
                        <ProductList/>
                        {!isReadOnly && (
                            <div className="accordionContainer">
                                <div className="accordionHeaderContainer">
                                    <button
                                        type="button"
                                        className={`addPersonButton`}
                                        data-testid="addPersonButton"
                                        onClick={(): void => setCurrentModal({modal: AvailableModals.CREATE_PERSON})}>
                                        <i className="material-icons" aria-hidden data-testid="addPersonIcon">add</i>
                                        <span>Add Person</span>
                                    </button>
                                    <UnassignedDrawer/>
                                    <ArchivedProductsDrawer/>
                                    <ReassignedDrawer/>
                                </div>
                            </div>
                        )}
                    </div>
                    <CurrentModal/>
                </main>
                <footer>
                    <Branding/>
                </footer>
            </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentModal: state.currentModal,
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    products: state.products,
    isReadOnly: state.isReadOnly,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: any) => ({
    fetchProducts: () => dispatch(fetchProductsAction()),
    fetchProductTags: () => dispatch(fetchProductTagsAction()),
    fetchPersonTags: () => dispatch(fetchPersonTagsAction()),
    fetchLocations: () => dispatch(fetchLocationsAction()),
    setPeople: (people: Array<Person>) => dispatch(setPeopleAction(people)),
    setSpace: (space: Space) => dispatch(setupSpaceAction(space)),
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleMover);
/* eslint-enable */
