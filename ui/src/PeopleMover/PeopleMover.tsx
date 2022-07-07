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

import React, {useEffect} from 'react';

import ProductList from '../Products/ProductList';
import Branding from '../ReusableComponents/Branding';
import {connect} from 'react-redux';
import SubHeader from '../Header/SubHeader';
import {GlobalStateProps} from '../Redux/Reducers';
import {useParams} from 'react-router-dom';
import ReassignedDrawer from '../ReassignedDrawer/ReassignedDrawer';
import UnassignedDrawer from '../Assignments/UnassignedDrawer';
import ArchivedProductsDrawer from '../Products/ArchivedProductsDrawer';
import MatomoEvents from '../Matomo/MatomoEvents';
import Counter from '../ReusableComponents/Counter';
import {AllGroupedTagFilterOptions, getFilterOptionsForSpace} from '../SortingAndFiltering/FilterLibraries';
import HeaderContainer from '../Header/HeaderContainer';
import ArchivedPersonDrawer from '../People/ArchivedPersonDrawer';
import {useRecoilState, useRecoilValue} from 'recoil';
import {ViewingDateState} from 'State/ViewingDateState';
import {IsReadOnlyState} from 'State/IsReadOnlyState';
import useFetchProducts from 'Hooks/useFetchProducts/useFetchProducts';
import useFetchPeople from 'Hooks/useFetchPeople/useFetchPeople';
import useFetchRoles from 'Hooks/useFetchRoles/useFetchRoles';
import useFetchLocations from 'Hooks/useFetchLocations/useFetchLocations';
import useFetchProductTags from 'Hooks/useFetchProductTags/useFetchProductTags';
import useFetchPersonTags from 'Hooks/useFetchPersonTags/useFetchPersonTags';
import useFetchCurrentSpace from '../Hooks/useFetchCurrentSpace/useFetchCurrentSpace';
import {ModalContentsState} from 'State/ModalContentsState';
import PersonForm from 'People/PersonForm';
import Modal from '../Modal/Modal';

import '../Styles/Main.scss';
import './PeopleMover.scss';
import {setAllGroupedTagFilterOptionsAction} from '../Redux/Actions';
import {Dispatch} from 'redux';

export interface PeopleMoverProps {
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function PeopleMover({ allGroupedTagFilterOptions, setAllGroupedTagFilterOptions }: PeopleMoverProps): JSX.Element {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();

    const viewingDate = useRecoilValue(ViewingDateState);
    const isReadOnly = useRecoilValue(IsReadOnlyState);
    const [modalContents, setModalContents] = useRecoilState(ModalContentsState);

    const { fetchPeople } = useFetchPeople(teamUUID);
    const { fetchRoles } = useFetchRoles(teamUUID);
    const { fetchLocations } = useFetchLocations(teamUUID)
    const { fetchProducts, products } = useFetchProducts(teamUUID);
    const { fetchProductTags } = useFetchProductTags(teamUUID);
    const { fetchPersonTags } = useFetchPersonTags(teamUUID);
    const { fetchCurrentSpace, currentSpace } = useFetchCurrentSpace(teamUUID);

    const hasProductsAndFilters: boolean = products && products.length > 0 && currentSpace && allGroupedTagFilterOptions.length > 0;

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
        if (!modalContents && teamUUID) {
            fetchCurrentSpace()
        }
    }, [modalContents, fetchCurrentSpace, teamUUID]);

    useEffect(() => {
        if (currentSpace && currentSpace.uuid) {
            getFilterOptionsForSpace(currentSpace.uuid!)
                .then(setAllGroupedTagFilterOptions);

            fetchProducts();
            fetchProductTags();
            fetchPersonTags();
            fetchLocations();
            fetchRoles();
            fetchPeople();
        }
    }, [currentSpace, fetchPeople, fetchProductTags, fetchPersonTags, fetchLocations, fetchRoles, fetchProducts]);

    return (
        !hasProductsAndFilters
            ? <></>
            : <div className="App">
                <HeaderContainer>
                    <SubHeader/>
                </HeaderContainer>
                <main>
                    <div id="main-content-landing-target"/>
                    <Counter
                        products={products}
                        allGroupedTagFilterOptions={allGroupedTagFilterOptions}
                        viewingDate={viewingDate}
                    />
                    <div className="productAndAccordionContainer">
                        <ProductList/>
                        {!isReadOnly && (
                            <div className="accordionContainer">
                                <div className="accordionHeaderContainer">
                                    <button
                                        type="button"
                                        className="addPersonButton"
                                        data-testid="addPersonButton"
                                        onClick={(): void => setModalContents({
                                            title: 'Add New Person',
                                            component: <PersonForm isEditPersonForm={false} />,
                                        })}>
                                        <i className="material-icons" aria-hidden data-testid="addPersonIcon">add</i>
                                        <span>Add Person</span>
                                    </button>
                                    <UnassignedDrawer/>
                                    <ReassignedDrawer/>
                                    <ArchivedPersonDrawer/>
                                    <ArchivedProductsDrawer/>
                                </div>
                            </div>
                        )}
                    </div>
                    <Modal />
                </main>
                <footer>
                    <Branding/>
                </footer>
            </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PeopleMover);
/* eslint-enable */
