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
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import AssignmentClient from '../Assignments/AssignmentClient';
import ProductClient from './ProductClient';
import TestUtils, {createDataTestId, renderWithRedux} from '../Utils/TestUtils';
import {applyMiddleware, createStore} from 'redux';
import rootReducer from '../Redux/Reducers';
import ProductTagClient from '../Tags/ProductTag/ProductTagClient';
import {Product} from './Product';
import {Person} from '../People/Person';
import LocationClient from '../Locations/LocationClient';
import selectEvent from 'react-select-event';
import moment from 'moment';
import ProductCard from './ProductCard';
import thunk from 'redux-thunk';
import {ViewingDateState} from '../State/ViewingDateState';
import {RecoilRoot} from 'recoil';

describe('Products', () => {
    const addProductButtonText = 'Add Product';
    const addProductModalTitle = 'Add New Product';

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    describe('Home page', () => {
        it('displays the product names', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            await screen.findByText('Product 3');
        });

        it('displays the product location', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            await screen.findByText('Dearborn');
        });

        it('displays the product tags', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            await screen.findByText('AV');
            expect(screen.queryByText('FordX')).not.toBeInTheDocument();
        });

        it('displays the empty product text', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            await screen.findAllByText('Add a person by clicking Add Person icon above or drag them in.');
        });

        it('should not make an update assignment call when dragging assignment card to same product', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                currentModal: {modal: null},
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithAssignments}/>
                </RecoilRoot>,
                store
            );

            AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({});

            const person1AssignmentCard = await screen.findByText('Person 1');
            fireEvent.click(person1AssignmentCard);
            expect(AssignmentClient.createAssignmentForDate).not.toHaveBeenCalled();
        });

        it('does not display the empty product text for a product with people', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            expect(screen.queryByText('Add a person by clicking')).not.toBeInTheDocument();
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

            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={productWithManyAssignments}/>
                </RecoilRoot>,
                store
            );

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

            expectedPersonsInOrder.forEach((person) => {
                const assignmentContainerDiv = screen.getByTestId(createDataTestId('assignmentCard', person.name));
                expect(assignmentContainerDiv.textContent).toContain(person.name);
            });
        });

        it('displays the add person icon', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            await screen.findByTestId('addPersonToProductIcon__product_3');
        });

        it('does not display the add person icon on the unassigned product', async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: false,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));
            renderWithRedux(
                <RecoilRoot initializeState={({set}) => {
                    set(ViewingDateState, new Date(2020, 4, 14))
                }}>
                    <ProductCard product={TestUtils.productWithoutAssignments}/>
                </RecoilRoot>,
                store
            );

            expect(screen.queryByTestId('addPersonToProductIcon__unassigned')).not.toBeInTheDocument();
        });

        // @todo should be a cypress test or more granular unit test
        xit('opens AssignmentForm component when button clicked with product populated', async () => {
            await TestUtils.renderPeopleMoverComponent();

            const addPersonButton = await screen.findByTestId('addPersonToProductIcon__product_1');
            fireEvent.click(addPersonButton);

            expect(screen.getByText('Assign a Person'));

            const multiSelectContainer = await screen.findByLabelText('Assign to');
            const inputElement: HTMLInputElement = multiSelectContainer.children[1].children[0] as HTMLInputElement;
            expect(inputElement.value).toEqual('Product 1');
        });

        it('ProductForm allows choices of locations provided by the API', async () => {
            await TestUtils.renderPeopleMoverComponent();

            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');
            const location = await screen.findByLabelText('Location');
            fireEvent.change(location, {target: {value: 'hi'}});
            await screen.findByText('hi');
            expect(screen.queryByText('Inner Sphere')).not.toBeInTheDocument();
        });

        it('should allow to create new location', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');

            const locationLabelElement = await screen.findByLabelText('Location');
            const containerToFindOptionsIn = {
                container: await screen.findByTestId('productForm'),
                createOptionText: TestUtils.expectedCreateOptionText('Ahmedabad'),
            };
            await act(async () => {
                await selectEvent.create(locationLabelElement, 'Ahmedabad', containerToFindOptionsIn);
            });
            const productForm = await screen.findByTestId('productForm');

            await waitFor(() => expect(LocationClient.add).toBeCalledTimes(1));
            expect(productForm).toHaveFormValues({location: '11'});
        });

        it('ProductForm allows choices of product tags provided by the API', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');
            const productTags = await screen.findByLabelText('Product Tags');
            fireEvent.change(productTags, {target: {value: ' '}});
            await screen.findByText('EV');
        });

        it('ProductForm allows to create product tag provided by user', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');
            const tagsLabelElement = await screen.findByLabelText('Product Tags');
            const containerToCreateFinTech = {
                container: await screen.findByTestId('productForm'),
                createOptionText: 'Create "Fin Tech"',
            };
            await act(async () => {
                await selectEvent.create(tagsLabelElement, 'Fin Tech', containerToCreateFinTech);
            })

            expect(ProductTagClient.add).toBeCalledTimes(1);

            ProductTagClient.add = jest.fn().mockResolvedValue({
                data: {id: 10, name: 'Some tag'},
            });

            const containerToCreateSomeTag = {
                container: await screen.findByTestId('productForm'),
                createOptionText: TestUtils.expectedCreateOptionText('Some tag'),
            };

            await act(async () => {
                await selectEvent.create(tagsLabelElement, 'Some tag', containerToCreateSomeTag);
            });
            expect(ProductTagClient.add).toBeCalledTimes(1);

            const productForm = await screen.findByTestId('productForm');
            expect(productForm).toHaveFormValues({productTags: ['9_Fin Tech', '10_Some tag']});
        });

        it('opens ProductForm with correct placeholder text in input fields', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByLabelText('Name');

            await screen.findByPlaceholderText('e.g. Product 1');
            await screen.findByText('Add product tags');
            await screen.findByText('Add a location tag');
        });

        it('opens ProductForm component when button clicked', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
        });

        it('opens ProductForm with product tag field', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
            await screen.findByLabelText('Product Tags');
        });

        it('should show duplicate product name warning when user tries to create product with same name', async () => {
            ProductClient.createProduct = jest.fn(() => Promise.reject({
                response: {
                    status: 409,
                },
            }));
            await TestUtils.renderPeopleMoverComponent();

            const newProductButton = await screen.findByText(addProductButtonText);
            fireEvent.click(newProductButton);

            await screen.findByText(addProductModalTitle);
            fireEvent.change(screen.getByLabelText('Name'), {target: {value: 'Product 1'}});

            fireEvent.click(screen.getByText('Add'));
            await screen.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show duplicate product name warning when user tries to edit product with same name', async () => {
            ProductClient.editProduct = jest.fn().mockRejectedValue({ response: { status: 409 } });
            await TestUtils.renderPeopleMoverComponent();

            const editProductMenuButton = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await screen.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            await screen.findByText('Edit Product');

            const nameInputField = await screen.findByLabelText('Name');
            fireEvent.change(nameInputField, {target: {value: 'Product 3'}});

            fireEvent.click(screen.getByText('Save'));
            await screen.findByText('A product with this name already exists. Please enter a different name.');
        });

        it('should show length of notes on initial render', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProductMenuButton = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(editProductMenuButton);

            const editProductOption = await screen.findByTestId('editMenuOption__edit_product');
            fireEvent.click(editProductOption);

            const notesFieldText = await screen.findByTestId('notesFieldText');
            const expectedNotes = TestUtils.productWithAssignments.notes || '';
            expect(notesFieldText.innerHTML).toContain(expectedNotes.length.toString());
        });

        it('displays people on each product', async () => {
            await TestUtils.renderPeopleMoverComponent();
            await screen.findByText('Person 1');
        });

        it('displays persons role on each assignment', async () => {
            await TestUtils.renderPeopleMoverComponent();
            await screen.findByText('Person 1');
            await screen.findByText('Software Engineer');
            expect(screen.queryByText('Product Designer')).not.toBeInTheDocument();
        });
    });

    describe('Deleting a product', () => {
        it('should show a delete button in the product modal', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);

            await screen.findByText('Delete Product');
        });

        it('should show the confirmation modal when a deletion is requested', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            fireEvent.click(screen.getByText('Delete Product'));

            await screen.findByText('Delete');
        });

        it('should call the product client with the product when a deletion is requested', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
            fireEvent.click(editProduct3Button);
            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            const deleteProductButton = await screen.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            const deleteButton = await screen.findByText('Delete');
            fireEvent.click(deleteButton);
            expect(ProductClient.deleteProduct).toBeCalledTimes(1);
            expect(ProductClient.deleteProduct).toBeCalledWith(TestUtils.space, TestUtils.productWithoutAssignments);
        });

        it('should not show archive button option in delete modal if product is already archived', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);

            const archivedProductButton = await screen.findByTestId('archivedProduct_4');
            fireEvent.click(archivedProductButton);
            await screen.findByText('Edit Product');
            const deleteProductButton = await screen.findByText('Delete Product');
            fireEvent.click(deleteProductButton);
            expect(screen.queryByText('Archive')).not.toBeInTheDocument();
        });

        describe('Archiving a product via the delete modal', () => {
            it('should use the product client to archive products', async () => {
                ProductClient.editProduct = jest.fn().mockResolvedValue({});

                const viewingDate = new Date(2020, 6, 17);
                const store = createStore(rootReducer, {}, applyMiddleware(thunk));
                await TestUtils.renderPeopleMoverComponent(store, undefined, (({set}) => {
                    set(ViewingDateState, viewingDate)
                }));

                const editProduct3Button = await screen.findByTestId('editProductIcon__product_3');
                fireEvent.click(editProduct3Button);
                const editProductMenuOption = await screen.findByText('Edit Product');
                fireEvent.click(editProductMenuOption);
                const deleteProductButton = await screen.findByText('Delete Product');
                fireEvent.click(deleteProductButton);
                const archiveButton = await screen.findByText('Archive');
                fireEvent.click(archiveButton);

                expect(ProductClient.editProduct).toBeCalledTimes(1);
                const cloneWithEndDateSet = JSON.parse(JSON.stringify(TestUtils.productWithoutAssignments));
                cloneWithEndDateSet.endDate = moment(viewingDate).subtract(1, 'day').format('YYYY-MM-DD');
                expect(ProductClient.editProduct).toBeCalledWith(TestUtils.space, cloneWithEndDateSet);
            });
        });
    });

    describe('Edit Menu for Product', () => {
        it('should pop the edit menu options', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            await screen.findByText('Edit Product');
            await screen.findByText('Archive Product');
        });

        it('should open edit modal when click on edit product', async () => {
            await TestUtils.renderPeopleMoverComponent();
            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            const editProductMenuOption = await screen.findByText('Edit Product');
            fireEvent.click(editProductMenuOption);
            await screen.findByText('Edit Product');
            await screen.findByText('Save');
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
                ProductClient.getProductsForDate = jest.fn().mockResolvedValue({ data: updatedProducts });
            }

            await TestUtils.renderPeopleMoverComponent();

            const myProductEllipsis = await screen.findByTestId('editProductIcon__product_1');
            fireEvent.click(myProductEllipsis);

            const archiveProductMenuOption = await screen.findByText('Archive Product');
            updateGetAllProductsResponse();
            fireEvent.click(archiveProductMenuOption);
            fireEvent.click(await screen.findByText('Archive'));
            await waitFor(() => {
                expect(screen.queryByText('Archive Product')).not.toBeInTheDocument();
                expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
            });
            const drawerCaret = await screen.findByTestId('archivedProductsDrawerCaret');
            fireEvent.click(drawerCaret);
            await screen.findByText('Product 1');
        });
    });

    describe('Read only view', () => {
        beforeEach(async () => {
            const initialState = {
                currentSpace: TestUtils.space,
                isReadOnly: true,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
            };

            const store = createStore(rootReducer, initialState, applyMiddleware(thunk));

            await waitFor(() => {
                renderWithRedux(
                    <RecoilRoot initializeState={({set}) => {
                        set(ViewingDateState, new Date(2020, 4, 14))
                    }}>
                        <ProductCard product={TestUtils.productWithAssignments}/>
                    </RecoilRoot>,
                    store
                );
            });
        });

        it('should not show edit product icon', async () => {
            expect(screen.queryByTestId(/editProductIcon/i)).not.toBeInTheDocument();
        });

        it('should not show add assignment icon', async () => {
            expect(screen.queryByTestId(/addPersonToProductIcon/i)).not.toBeInTheDocument();
        });
    });
});
