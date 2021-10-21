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

import React from 'react';
import {AxiosResponse} from 'axios';
import {act, fireEvent, RenderResult} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import AssignmentClient from '../Assignments/AssignmentClient';
import ProductClient from './ProductClient';
import TestUtils, {createDataTestId, renderWithRedux} from '../tests/TestUtils';
import {wait} from '@testing-library/dom';
import {applyMiddleware, createStore, PreloadedState, Store} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import {Product} from './Product';
import {Person} from '../People/Person';
import LocationClient from '../Locations/LocationClient';
import selectEvent from 'react-select-event';
import moment from 'moment';
import {createBrowserHistory} from 'history';
import {Router} from 'react-router-dom';
import ProductCard from './ProductCard';
import thunk from 'redux-thunk';

jest.mock('axios');

describe('Products', () => {
    const addProductButtonText = 'Add Product';
    const addProductModalTitle = 'Add New Product';
    let store: Store;


    function applicationSetup(store?: Store, initialState?: PreloadedState<GlobalStateProps>): RenderResult {
        let history = createBrowserHistory();
        history.push('/uuid');

        return renderWithRedux(
            <Router history={history}>
                <PeopleMover/>
            </Router>,
            store,
            initialState
        );
    }

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('Home page', () => {

        it('displays the product names', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithoutAssignments}/>,
                store);

            await app.findByText('Product 3');
        });

        it('displays the product location', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithoutAssignments}/>,
                store);

            await app.findByText('Dearborn');
        });

        it('displays the product tags', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithoutAssignments}/>,
                store);

            await app.findByText('AV');
            expect(app.queryByText('FordX')).not.toBeInTheDocument();
        });

        it('displays the empty product text', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithoutAssignments}/>,
                store);

            await app.findAllByText('Add a person by clicking Add Person icon above or drag them in.');
        });

        it('should not make an update assignment call when dragging assignment card to same product', async () => {
            await act(async () => {

                let initialState = {
                    currentSpace: TestUtils.space,
                    viewingDate: new Date(2020, 4, 14),
                    isReadOnly: false,
                    allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                    currentModal: {modal: null},
                };

                store = createStore(rootReducer, initialState, applyMiddleware(thunk));
                let app = await renderWithRedux(
                    <ProductCard product={TestUtils.productWithAssignments}/>,
                    store);

                AssignmentClient.createAssignmentForDate = jest.fn(() => Promise.resolve({} as AxiosResponse));

                const person1AssignmentCard = await app.findByText('Person 1');
                fireEvent.click(person1AssignmentCard);
                expect(AssignmentClient.createAssignmentForDate).not.toHaveBeenCalled();
            });
        });

        it('does not display the empty product text for a product with people', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithAssignments}/>,
                store);

            expect(app.queryByText('Add a person by clicking')).not.toBeInTheDocument();
        });

        it('orders the AssignmentCards on the product by role, then name, then id', async () => {
            const productWithManyAssignments: Product = {
                id: 2,
                name: 'Product 1',
                startDate: '2011-01-01',
                endDate: '2022-02-02',
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                assignments: [
                    {
                        id: 1,
                        productId: 2,
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        person: {
                            newPerson: false,
                            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                            id: 1,
                            name: 'Person 1',
                            spaceRole: {
                                name: 'herp',
                                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                                id: 2,
                                color: {color: '1', id: 2},
                            },
                            tags: [],
                        },
                        placeholder: false,
                    },
                    {
                        id: 900,
                        productId: 2,
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        person: {
                            newPerson: false,
                            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                            id: 900,
                            name: 'Bobby',
                            spaceRole: {
                                name: 'herp',
                                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                                id: 2,
                                color: {color: '1', id: 2},
                            },
                            tags: [],
                        },
                        placeholder: false,
                    },
                    {
                        id: 4,
                        productId: 2,
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        person: {
                            newPerson: false,
                            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                            id: 4,
                            name: 'Hank 2',
                            spaceRole: {
                                name: 'herp',
                                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                                id: 2,
                                color: {color: '1', id: 2},
                            },
                            tags: [],
                        },
                        placeholder: false,
                    },
                    {
                        id: 3,
                        productId: 2,
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        person: {
                            newPerson: false,
                            spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                            id: 3,
                            name: 'Hank 1',
                            spaceRole: {
                                name: 'herp',
                                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                                id: 2,
                                color: {color: '1', id: 2},
                            },
                            tags: [],
                        },
                        placeholder: false,
                    },
                ],
                spaceLocation: {
                    name: 'Ann Arbor',
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    id: 3,
                },
                archived: false,
                tags: [],
            };

            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={productWithManyAssignments}/>,
                store);

            const expectedPersonsInOrder: Array<Person> = [
                {
                    name: 'Bobby',
                    id: 900,
                    newPerson: false,
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    spaceRole: {
                        name: 'herp',
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        id: 2,
                        color: {color: '1', id: 2},
                    },
                    tags: [],
                },
                {
                    name: 'Hank 1',
                    id: 3,
                    newPerson: false,
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    spaceRole: {
                        name: 'herp',
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        id: 2,
                        color: {color: '1', id: 2},
                    },
                    tags: [],
                },
                {
                    name: 'Hank 2',
                    id: 4,
                    newPerson: false,
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    spaceRole: {
                        name: 'herp',
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        id: 2,
                        color: {color: '1', id: 2},
                    },
                    tags: [],
                },
                {
                    name: 'Person 1',
                    id: 1,
                    newPerson: false,
                    spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                    spaceRole: {
                        name: 'herp',
                        spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                        id: 2,
                        color: {color: '1', id: 2},
                    },
                    tags: [],
                },
            ];

            const assignmentCardIds = productWithManyAssignments.assignments.map(assignment => assignment.id);
            expect(assignmentCardIds.length).toBe(4);

            expectedPersonsInOrder.forEach((person, index) => {
                const assignmentContainerDiv = app.getByTestId(createDataTestId('assignmentCard', person.name));
                expect(assignmentContainerDiv.textContent).toContain(person.name);
            });
        });

        it('displays the add person icon', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.productWithoutAssignments}/>,
                store);

            await app.findByTestId('addPersonToProductIcon__product_3');
        });

        it('does not display the add person icon on the unassigned product', async () => {
            let initialState = {
                currentSpace: TestUtils.space,
                viewingDate: new Date(2020, 4, 14),
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            let app = await renderWithRedux(
                <ProductCard product={TestUtils.unassignedProduct}/>,
                store);

            expect(app.queryByTestId('addPersonToProductIcon__unassigned')).not.toBeInTheDocument();
        });

        it('opens AssignmentForm component when button clicked with product populated', async () => {
            const app = applicationSetup();


            const addPersonButton = await app.findByTestId('addPersonToProductIcon__product_1');
            fireEvent.click(addPersonButton);

            expect(app.getByText('Assign a Person'));

            const multiSelectContainer = await app.findByLabelText('Assign to');
            const inputElement: HTMLInputElement = multiSelectContainer.children[1].children[0] as HTMLInputElement;
            expect(inputElement.value).toEqual('Product 1');
        });

        it('ProductForm allows choices of locations provided by the API', async () => {
            const app = applicationSetup();

            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            const location = await app.findByLabelText('Location');
            fireEvent.change(location, {target: {value: 'hi'}});
            await app.findByText('hi');
            expect(app.queryByText('Inner Sphere')).not.toBeInTheDocument();
        });

        it('should allow to create new location', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                const locationLabelElement = await app.findByLabelText('Location');
                const containerToFindOptionsIn = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: TestUtils.expectedCreateOptionText('Ahmedabad'),
                };
                await selectEvent.create(locationLabelElement, 'Ahmedabad', containerToFindOptionsIn);
                const productForm = await app.findByTestId('productForm');

                await wait(() => {
                    expect(LocationClient.add).toBeCalledTimes(1);

                });
                expect(productForm).toHaveFormValues({location: '11'});
            });
        });

        it('ProductForm allows choices of product tags provided by the API', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            const productTags = await app.findByLabelText('Product Tags');
            fireEvent.change(productTags, {target: {value: ' '}});
            await app.findByText('EV');
        });

        it('ProductForm allows to create product tag provided by user', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                const tagsLabelElement = await app.findByLabelText('Product Tags');
                const containerToCreateFinTech = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: 'Create "Fin Tech"',
                };
                await selectEvent.create(tagsLabelElement, 'Fin Tech', containerToCreateFinTech);
                expect(ProductTagClient.add).toBeCalledTimes(1);

                ProductTagClient.add = jest.fn(() => Promise.resolve({
                    data: {id: 10, name: 'Some tag'},
                } as AxiosResponse));

                const containerToCreateSomeTag = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: TestUtils.expectedCreateOptionText('Some tag'),
                };

                await selectEvent.create(tagsLabelElement, 'Some tag', containerToCreateSomeTag);
                expect(ProductTagClient.add).toBeCalledTimes(1);

                const productForm = await app.findByTestId('productForm');

                expect(productForm).toHaveFormValues({productTags: ['9_Fin Tech', '10_Some tag']});
            });
        });

        it('opens ProductForm with correct placeholder text in input fields', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');

            await app.findByPlaceholderText('e.g. Product 1');
            await app.findByText('Add product tags');
            await app.findByText('Add a location tag');
        });

        it('opens ProductForm component when button clicked', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByText(addProductModalTitle);
        });

        it('opens ProductForm with product tag field', async () => {
            const app = applicationSetup();
            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByText(addProductModalTitle);
            await app.findByLabelText('Product Tags');
        });

        it('should show duplicate product name warning when user tries to create product with same name', async () => {
            ProductClient.createProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            const app = applicationSetup();

            const newProductButton = await app.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await app.findByText(addProductModalTitle);
            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Product 1'}});

            fireEvent.click(app.getByText('Add'));
            await app.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show duplicate product name warning when user tries to edit product with same name', async () => {
            ProductClient.editProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            const app = applicationSetup();

            const editProductMenuButton = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await app.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            await app.findByText('Edit Product');

            const nameInputField = await app.findByLabelText('Name');
            fireEvent.change(nameInputField, {target: {value: 'Product 3'}});

            fireEvent.click(app.getByText('Save'));
            await app.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show length of notes on initial render', async () => {
            const app = applicationSetup();
            const editProductMenuButton = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await app.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            const notesFieldText = await app.findByTestId('notesFieldText');
            const expectedNotes = TestUtils.productWithAssignments.notes || '';
            expect(notesFieldText.innerHTML).toContain(expectedNotes.length);
        });

        it('displays people on each product', async () => {
            const app = applicationSetup();
            await app.findByText('Person 1');
        });

        it('displays persons role on each assignment', async () => {
            const app = applicationSetup();
            await app.findByText('Person 1');
            await app.findByText('Software Engineer');
            expect(app.queryByText('Product Designer')).not.toBeInTheDocument();
        });
    });

    describe('Deleting a product', () => {
        it('should show a delete button in the product modal', async () => {
            const app = applicationSetup();
            const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);

            await app.findByText('Delete Product');
        });

        it('should show the confirmation modal when a deletion is requested', async () => {
            const app = applicationSetup();
            const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            fireEvent.click(app.getByText('Delete Product'));

            await app.findByText('Delete');
        });

        it('should call the product client with the product when a deletion is requested', async () => {
            await act(async () => {
                const app = applicationSetup();
                const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
                fireEvent.click(editProduct3Button);
                const editProductMenuOption = await app.findByText('Edit Product');
                fireEvent.click(editProductMenuOption);
                const deleteProductButton = await app.findByText('Delete Product');
                fireEvent.click(deleteProductButton);
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);
            });
            expect(ProductClient.deleteProduct).toBeCalledTimes(1);
            expect(ProductClient.deleteProduct).toBeCalledWith(TestUtils.space, TestUtils.productWithoutAssignments);
        });

        it('should not show archive button option in delete modal if product is already archived', async () => {
            const app = applicationSetup();
            const drawerCaret = await app.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);

            const archivedProductButton = await app.findByTestId('archivedProduct_4');
            fireEvent.click(archivedProductButton);
            await app.findByText('Edit Product');
            const deleteProductButton = await app.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            expect(app.queryByText('Archive')).not.toBeInTheDocument();
        });

        describe('Archiving a product via the delete modal', () => {
            it('should use the product client to archive products', async () => {
                ProductClient.editProduct = jest.fn().mockResolvedValue({});

                const viewingDate = new Date(2020, 6, 17);
                const initialState = {viewingDate: viewingDate};
                await act(async () => {
                    store = createStore(rootReducer, initialState, applyMiddleware(thunk));
                    const app = applicationSetup(store);

                    const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
                    fireEvent.click(editProduct3Button);
                    const editProductMenuOption = await app.findByText('Edit Product');
                    fireEvent.click(editProductMenuOption);
                    const deleteProductButton = await app.findByText('Delete Product');
                    fireEvent.click(deleteProductButton);
                    const archiveButton = await app.findByText('Archive');
                    fireEvent.click(archiveButton);
                });
                expect(ProductClient.editProduct).toBeCalledTimes(1);
                const cloneWithEndDateSet = JSON.parse(JSON.stringify(TestUtils.productWithoutAssignments));
                cloneWithEndDateSet.endDate = moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD');
                expect(ProductClient.editProduct).toBeCalledWith(TestUtils.space, cloneWithEndDateSet);
            });
        });
    });

    describe('Edit Menu for Product', () => {
        it('should pop the edit menu options', async () => {
            const app = applicationSetup();
            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            await app.findByText('Edit Product');
            await app.findByText('Archive Product');
        });

        it('should open edit modal when click on edit product', async () => {
            const app = applicationSetup();
            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            await app.findByText('Edit Product');
            await app.findByText('Save');
        });

        it('should put product in archived products when clicking archive product', async () => {
            function updateGetAllProductsResponse(): void {
                const updatedProduct = {
                    ...TestUtils.productWithAssignments,
                    archived: true,
                };
                const updatedProducts = [
                    updatedProduct,
                    TestUtils.unassignedProduct,
                ];
                ProductClient.getProductsForDate = jest.fn(() => Promise.resolve(
                    {
                        data: updatedProducts,
                    } as AxiosResponse,
                ));
            }

            const app = applicationSetup();

            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            const archiveProductMenuOption = await app.findByText('Archive Product');
            updateGetAllProductsResponse();
            fireEvent.click(archiveProductMenuOption);
            fireEvent.click(await app.findByText('Archive'));
            await wait(() => {
                expect(app.queryByText('Archive Product')).not.toBeInTheDocument();
                expect(app.queryByText('Product 1')).not.toBeInTheDocument();
            });
            const drawerCaret = await app.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            await app.findByText('Product 1');
        });
    });

    describe('Read only view', () => {
        let app: RenderResult;
        beforeEach(async () => {
            await wait(() => {
                let initialState = {
                    currentSpace: TestUtils.space,
                    viewingDate: new Date(2020, 4, 14),
                    isReadOnly: true,
                    allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                };

                store = createStore(rootReducer, initialState, applyMiddleware(thunk));
                app = renderWithRedux(
                    <ProductCard product={TestUtils.productWithAssignments}/>,
                    store);
            });
        });

        it('should not show edit product icon', async () => {
            expect(app.queryByTestId(/editProductIcon/i)).not.toBeInTheDocument();
        });

        it('should not show add assignment icon', async () => {
            expect(app.queryByTestId(/addPersonToProductIcon/i)).not.toBeInTheDocument();
        });
    });
});
