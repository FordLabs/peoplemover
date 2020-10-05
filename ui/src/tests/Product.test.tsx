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
import {AxiosResponse} from 'axios';
import {act, fireEvent} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import AssignmentClient from '../Assignments/AssignmentClient';
import ProductClient from '../Products/ProductClient';
import TestUtils, {renderWithRedux} from './TestUtils';
import {wait} from '@testing-library/dom';
import {applyMiddleware, compose, createStore, PreloadedState, Store} from 'redux';
import rootReducer, {GlobalStateProps} from '../Redux/Reducers';
import thunk from 'redux-thunk';
import ProductTagClient from '../ProductTag/ProductTagClient';
import {Product} from '../Products/Product';
import {Person} from '../People/Person';
import LocationClient from '../Locations/LocationClient';
import selectEvent from 'react-select-event';
import moment from 'moment';

describe('Products', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('home page', () => {
        it('displays the product names', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('Product 1');
            await app.findByText('Product 3');
            expect(app.queryByText('unassigned')).toBeNull();
        });

        it('displays the product location', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('Southfield');
            await app.findByText('Dearborn');
            expect(app.queryByText('Detroit')).not.toBeInTheDocument();
        });

        it('displays the product tags', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findByText('AV');
            await app.findByText('FordX');
            expect(app.queryByText('Fin Tech')).not.toBeInTheDocument();
        });

        it('displays the empty product text', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await app.findAllByText('Add a person by clicking');
        });

        it('does not display the empty product text for a product with people', async () => {
            ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
                data: TestUtils.notEmptyProducts,
            } as AxiosResponse));

            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByText('Add a person by clicking')).not.toBeInTheDocument();
        });

        it('should not make an update assignment call when dragging assignment card to same product', async () => {
            await act(async () => {
                const state = {
                    currentModal: {modal: null},
                };
                const store: Store = createStore(rootReducer,
                    state,
                    compose(applyMiddleware(thunk)),
                );

                const component = <PeopleMover/>;
                const wrapper = await renderWithRedux(component, store);
                await TestUtils.waitForHomePageToLoad(wrapper);

                AssignmentClient.createAssignmentForDate = jest.fn(() => Promise.resolve({} as AxiosResponse));

                const person1AssignmentCard = await wrapper.findByText('Person 1');
                fireEvent.mouseDown(person1AssignmentCard);
                fireEvent.mouseUp(person1AssignmentCard);
                expect(AssignmentClient.createAssignmentForDate).not.toHaveBeenCalled();
            });
        });

        it('orders the AssignmentCards on the product by role, then name, then id', async () => {
            const productWithManyAssignments: Product = {
                id: 2,
                name: 'Product 1',
                startDate: '2011-01-01',
                endDate: '2022-02-02',
                spaceId: 0,
                assignments: [
                    {
                        id: 1,
                        productId: 2,
                        spaceId: 0,
                        person: {
                            newPerson: false,
                            spaceId: 0,
                            id: 1,
                            name: 'Person 1',
                            spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                        },
                        placeholder: false,
                    },
                    {
                        id: 900,
                        productId: 2,
                        spaceId: 0,
                        person: {
                            newPerson: false,
                            spaceId: 0,
                            id: 900,
                            name: 'Bobby',
                            spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                        },
                        placeholder: false,
                    },
                    {
                        id: 4,
                        productId: 2,
                        spaceId: 0,
                        person: {
                            newPerson: false,
                            spaceId: 0,
                            id: 4,
                            name: 'Hank',
                            spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                        },
                        placeholder: false,
                    },
                    {
                        id: 3,
                        productId: 2,
                        spaceId: 0,
                        person: {
                            newPerson: false,
                            spaceId: 0,
                            id: 3,
                            name: 'Hank',
                            spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                        },
                        placeholder: false,
                    },
                ],
                spaceLocation: {
                    name: 'Ann Arbor',
                    spaceId: 1,
                    id: 3,
                },
                archived: false,
                productTags: [],
            };
            ProductClient.getProductsForDate = jest.fn(() => Promise.resolve({
                data: [productWithManyAssignments],
            } as AxiosResponse,
            ));
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            const expectedPersonsInOrder: Array<Person> = [
                {
                    name: 'Bobby',
                    id: 900,
                    newPerson: false,
                    spaceId: 0,
                    spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                },
                {
                    name: 'Hank',
                    id: 3,
                    newPerson: false,
                    spaceId: 0,
                    spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                },
                {
                    name: 'Hank',
                    id: 4,
                    newPerson: false,
                    spaceId: 0,
                    spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                },
                {
                    name: 'Person 1',
                    id: 1,
                    newPerson: false,
                    spaceId: 0,
                    spaceRole: {name: 'herp', spaceId: 0, id: 2, color: {color: '1', id: 2}},
                },
            ];

            const assignmentCardIds = productWithManyAssignments.assignments.map(assignment => assignment.id);
            expect(assignmentCardIds.length).toBe(4);

            expectedPersonsInOrder.forEach((person, index) => {
                const assignmentContainerDiv = app.getByTestId(`assignmentCard${assignmentCardIds[index]}`);
                expect(assignmentContainerDiv.textContent).toContain(person.name);
            });
        });

        it('displays the add person icon', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            await app.findByTestId('addPersonToProductIcon__product_1');
            await app.findByTestId('addPersonToProductIcon__product_3');
        });

        it('does not display the add person icon on the unassigned product', async () => {
            const app = renderWithRedux(<PeopleMover/>);
            await TestUtils.waitForHomePageToLoad(app);

            expect(app.queryByTestId('addPersonToProductIcon-999')).not.toBeInTheDocument();
        });

        it('opens AssignmentForm component when button clicked with product populated', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const addPersonButton = await app.findByTestId('addPersonToProductIcon__product_1');
            fireEvent.click(addPersonButton);

            expect(app.getByText('Assign a Person'));

            const multiSelectContainer = await app.findByLabelText('Assign to');
            const inputElement: HTMLInputElement = multiSelectContainer.children[1].children[0] as HTMLInputElement;
            expect(inputElement.value).toEqual('Product 1');
        });

        it('ProductForm allows choices of locations provided by the API', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            const location = await app.findByLabelText('Location');
            fireEvent.change(location, {target: {value: 'hi'}});
            await app.findByText('hi');
            expect(app.queryByText('Inner Sphere')).not.toBeInTheDocument();
        });

        it('should allow to create new location', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                const locationLabelElement = await app.findByLabelText('Location');
                const containerToFindOptionsIn = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: /Create "Ahmedabad"/,
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
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            const productTags = await app.findByLabelText('Product Tags');
            fireEvent.change(productTags, {target: {value: ' '}});
            await app.findByText('EV');
        });

        it('ProductForm allows to create product tag provided by user', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');
            await act(async () => {
                const tagsLabelElement = await app.findByLabelText('Product Tags');
                const containerToCreateFinTech = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: /Create "Fin Tech"/,
                };
                await selectEvent.create(tagsLabelElement, 'Fin Tech', containerToCreateFinTech);
                expect(ProductTagClient.add).toBeCalledTimes(1);

                ProductTagClient.add = jest.fn(() => Promise.resolve({
                    data: {id: 10, name: 'Some tag'},
                } as AxiosResponse));

                const containerToCreateSomeTag = {
                    container: await app.findByTestId('productForm'),
                    createOptionText: /Create "Some tag"/,
                };

                await selectEvent.create(tagsLabelElement, 'Some tag', containerToCreateSomeTag);
                expect(ProductTagClient.add).toBeCalledTimes(1);

                const productForm = await app.findByTestId('productForm');

                expect(productForm).toHaveFormValues({productTags: ['9_Fin Tech', '10_Some tag']});
            });
        });

        it('opens ProductForm with correct placeholder text in input fields', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByLabelText('Name');

            await app.findByPlaceholderText('e.g. Product 1');
            await app.findByText('Select or create location');
        });

        it('opens ProductForm component when button clicked', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByText('Create New Product');
        });

        it('opens ProductForm with product tag field', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByText('Create New Product');
            await app.findByLabelText('Product Tags');
        });

        it('should show duplicate product name warning when user tries to create product with same name', async () => {
            ProductClient.createProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            const app = renderWithRedux(<PeopleMover/>);

            const newProductButton = await app.findByText('New Product');
            fireEvent.click(newProductButton);

            await app.findByText('Create New Product');
            fireEvent.change(app.getByLabelText('Name'), {target: {value: 'Product 1'}});

            fireEvent.click(app.getByText('Create'));
            await app.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show duplicate product name warning when user tries to edit product with same name', async () => {
            ProductClient.editProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            const app = renderWithRedux(<PeopleMover/>);

            const editProductMenuButton = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await app.findByTestId('editMenuOption0');
            fireEvent.mouseDown(editProductOption);
            fireEvent.mouseUp(editProductOption);

            await app.findByText('Edit Product');

            const nameInputField = await app.findByLabelText('Name');
            fireEvent.change(nameInputField, {target: {value: 'Product 3'}});

            fireEvent.click(app.getByText('Save'));
            await app.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show length of notes on initial render', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editProductMenuButton = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await app.findByTestId('editMenuOption0');
            fireEvent.mouseDown(editProductOption);
            fireEvent.mouseUp(editProductOption);

            const notesFieldText = await app.findByTestId('notesFieldText');
            const expectedNotes = TestUtils.productWithAssignments.notes || '';
            expect(notesFieldText.innerHTML).toContain(expectedNotes.length);
        });

        it('displays people on each product', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            await app.findByText('Person 1');
        });

        it('displays persons role on each assignment', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            await app.findByText('Person 1');
            await app.findByText('Software Engineer');
            expect(app.queryByText('Product Designer')).not.toBeInTheDocument();
        });
    });

    describe('deleting a product', () => {
        it('should show a delete button in the product modal', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.mouseDown(editProductMenuOption);
            fireEvent.mouseUp(editProductMenuOption);

            await app.findByText('Delete Product');
        });

        it('should show the confirmation modal when a deletion is requested', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.mouseDown(editProductMenuOption);
            fireEvent.mouseUp(editProductMenuOption);
            fireEvent.click(app.getByText('Delete Product'));

            await app.findByText('Delete');
        });

        it('should call the product client with the product when a deletion is requested', async () => {
            await act(async () => {
                const app = renderWithRedux(<PeopleMover/>);
                const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
                fireEvent.click(editProduct3Button);
                const editProductMenuOption = await app.findByText('Edit Product');
                fireEvent.mouseDown(editProductMenuOption);
                fireEvent.mouseUp(editProductMenuOption);
                const deleteProductButton = await app.findByText('Delete Product');
                fireEvent.click(deleteProductButton);
                const deleteButton = await app.findByText('Delete');
                fireEvent.click(deleteButton);
            });
            expect(ProductClient.deleteProduct).toBeCalledTimes(1);
            expect(ProductClient.deleteProduct).toBeCalledWith(TestUtils.space.uuid, TestUtils.productWithoutAssignments);
        });

        it('should not show archive button option in delete modal if product is already archived', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const drawerCarets = await app.findAllByTestId('drawerCaret');
            // TODO: change to drawerCarets[2] after reinstating ReassignedDrawer
            const archivedProductsDrawer = drawerCarets[1];
            fireEvent.click(archivedProductsDrawer);

            const archivedProductButton = await app.findByTestId('archivedProduct_4');
            fireEvent.click(archivedProductButton);
            await app.findByText('Edit Product');
            const deleteProductButton = await app.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            expect(app.queryByText('Archive')).not.toBeInTheDocument();
        });

        describe('archiving a product via the delete modal', () => {
            it('should use the product client to archive products', async () => {
                ProductClient.editProduct = jest.fn(() => Promise.resolve({} as AxiosResponse));

                const viewingDate = new Date(2020, 6, 17);
                const initialState: PreloadedState<GlobalStateProps> = { viewingDate: viewingDate } as GlobalStateProps;
                await act(async () => {
                    const app = renderWithRedux(<PeopleMover/>, undefined, initialState);

                    const editProduct3Button = await app.findByTestId('editProductIcon__product_3');
                    fireEvent.click(editProduct3Button);
                    const editProductMenuOption = await app.findByText('Edit Product');
                    fireEvent.mouseDown(editProductMenuOption);
                    fireEvent.mouseUp(editProductMenuOption);
                    const deleteProductButton = await app.findByText('Delete Product');
                    fireEvent.click(deleteProductButton);
                    const archiveButton = await app.findByText('Archive');
                    fireEvent.click(archiveButton);
                });
                expect(ProductClient.editProduct).toBeCalledTimes(1);
                const cloneWithEndDateSet = JSON.parse(JSON.stringify(TestUtils.productWithoutAssignments));
                cloneWithEndDateSet.endDate = moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD');
                expect(ProductClient.editProduct).toBeCalledWith(TestUtils.space.uuid, cloneWithEndDateSet);
            });
        });
    });

    describe('Edit Menu for Product', () => {
        it('should pop the edit menu options', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            await app.findByText('Edit Product');
            await app.findByText('Archive Product');
        });

        it('should open edit modal when click on edit product', async () => {
            const app = renderWithRedux(<PeopleMover/>);

            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            const editProductMenuOption = await app.findByText('Edit Product');
            fireEvent.mouseDown(editProductMenuOption);
            fireEvent.mouseUp(editProductMenuOption);
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
                ];
                ProductClient.getProductsForDate = jest.fn(() => Promise.resolve(
                    {
                        data: updatedProducts,
                    } as AxiosResponse,
                ));
            }

            const app = renderWithRedux(<PeopleMover/>);

            const myProductElipsis = await app.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductElipsis);

            const archiveProductMenuOption = await app.findByText('Archive Product');
            updateGetAllProductsResponse();
            fireEvent.mouseDown(archiveProductMenuOption);
            fireEvent.mouseUp(archiveProductMenuOption);
            await wait(() => {
                expect(app.queryByText('Archive Product')).not.toBeInTheDocument();
                expect(app.queryByText('Product 1')).not.toBeInTheDocument();
            });
            const drawerCarets = await app.findAllByTestId('drawerCaret');
            // TODO: change to drawerCarets[2] after reinstating ReassignedDrawer
            const archivedProductDrawerOpener = drawerCarets[1];

            fireEvent.click(archivedProductDrawerOpener);
            await app.findByText('Product 1');
        });
    });

});
