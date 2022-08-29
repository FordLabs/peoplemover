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
import {createDataTestId, renderWithRecoil} from 'Utils/TestUtils';
import TestData from 'Utils/TestData';
import {emptyProduct} from 'Services/ProductService';
import ProductCard from './ProductCard';
import {fireEvent, screen, waitFor, within} from '@testing-library/react';
import ProductClient from 'Services/Api/ProductClient';
import moment from 'moment';
import AssignmentClient from 'Services/Api/AssignmentClient';
import {ViewingDateState} from 'State/ViewingDateState';
import {ProductsState} from 'State/ProductsState';
import {CurrentSpaceState} from 'State/CurrentSpaceState';
import {Product} from 'Types/Product';
import {Person} from '../../Types/Person';
import {IsReadOnlyState} from '../../State/IsReadOnlyState';

jest.mock('Services/Api/AssignmentClient');

describe('ProductCard', () => {
    const mayFourteenth2020 = new Date(2020, 4, 14);
    const products = [TestData.unassignedProduct,
        TestData.productWithoutAssignments,
        TestData.archivedProduct,
        TestData.productWithoutLocation,
        TestData.productWithAssignments,
        {...TestData.productForHank, assignments: [
            TestData.assignmentForHank,
            {...TestData.assignmentForPerson1, productId: TestData.productForHank.id},
        ]},
    ];

    describe('Product Name', () => {
        it('should render product name NOT as a link if url is not present', async () => {
            const expectedProductName = 'testProduct'
            renderProductCard({...emptyProduct(), name: expectedProductName});
            const productNameLink = await screen.findByTestId('productName');
            expect(productNameLink).toHaveTextContent(expectedProductName)
            expect(productNameLink).not.toHaveAttribute('href');
        });

        it('should render product name as a link if url is present', async () => {
            const expectedUrl = 'www.any-old-url.com'
            renderProductCard({...emptyProduct(), name: 'testProduct', url: expectedUrl });

            const productNameLink = await screen.findByTestId('productName');
            expect(productNameLink).toHaveAttribute('href', expectedUrl);
            expect(within(productNameLink).getByTestId('productUrl')).toBeDefined();
        });
    });

    it('should displays product location and product tags', async () => {
        renderProductCard(TestData.productWithoutAssignments);
        await screen.findByText('Dearborn');
        await screen.findByText('AV');
        expect(screen.queryByText('FordX')).not.toBeInTheDocument();
    });

    it('should displays the add person icon when not read only', async () => {
        renderProductCard(TestData.productWithoutAssignments, false);
        await screen.findByTestId('addPersonToProductIcon__product_3');
    });

    describe('Read only view', () => {
        beforeEach(() => {
            renderProductCard(TestData.productWithAssignments, true)
        });

        it('should not show edit product icon', async () => {
            expect(screen.queryByTestId(/editProductIcon/i)).not.toBeInTheDocument();
        });

        it('should not show add assignment icon', async () => {
            expect(screen.queryByTestId(/addPersonToProductIcon/i)).not.toBeInTheDocument();
        });

        it('should hide the add person icon when read only', () => {
            expect(screen.queryByTestId('addPersonToProductIcon__unassigned')).not.toBeInTheDocument();
        });
    });

    it('should display message when product has no assignments', async () => {
        renderProductCard(TestData.productWithoutAssignments);
        await screen.findAllByText('Add a person by clicking Add Person icon above or drag them in.');
    });

    it('should not display message when product has assignments', async () => {
        renderProductCard(TestData.productWithoutAssignments);
        expect(screen.queryByText('Add a person by clicking')).not.toBeInTheDocument();
    });

    it('should not make an update assignment call when dragging assignment card to same product', async () => {
        renderProductCard(TestData.productWithAssignments);

        AssignmentClient.createAssignmentForDate = jest.fn().mockResolvedValue({});

        const person1AssignmentCard = await screen.findByText('Person 1');
        fireEvent.click(person1AssignmentCard);
        expect(AssignmentClient.createAssignmentForDate).not.toHaveBeenCalled();
    });

    it('should order the AssignmentCards on the product by role, then name, then id', async () => {
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

        renderProductCard(productWithManyAssignments);

        const expectedPersonsInOrder: Person[] = [
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

    it('archiving a product sets the appropriate fields in the product and moves all people to unassigned', async () => {
        const may13String = moment(mayFourteenth2020).subtract(1, 'day').format('YYYY-MM-DD');
        const may14String = moment(mayFourteenth2020).format('YYYY-MM-DD');
        const testProduct = {...TestData.productWithAssignments, assignments: [TestData.assignmentForPerson1, TestData.assignmentForPerson2, TestData.assignmentForPerson3]};

        ProductClient.editProduct = jest.fn().mockResolvedValue({data: {...testProduct, endDate: may13String}});

        renderProductCard(testProduct);

        fireEvent.click(await screen.findByTestId(createDataTestId('editProductIcon', TestData.productWithAssignments.name)));
        fireEvent.click(await screen.findByText('Archive Product'));
        fireEvent.click(screen.getByText('Archive'));

        await waitFor(() => expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledTimes(3));
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [{productId: TestData.productForHank.id, placeholder: false}], TestData.space, TestData.person1);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestData.space, TestData.person2);
        expect(AssignmentClient.createAssignmentForDate).toHaveBeenCalledWith(may14String, [], TestData.space, TestData.person3);
        expect(ProductClient.editProduct).toHaveBeenCalledTimes(1);
        expect(ProductClient.editProduct).toHaveBeenCalledWith(TestData.space, {...testProduct, endDate: may13String});
    });

    it('should show a confirmation modal when Archive Person is clicked, and be able to close it', async () => {
        renderProductCard(TestData.productWithAssignments);
        expectEditMenuContents(false);

        const editProductSelector = createDataTestId('editProductIcon', TestData.productWithAssignments.name)
        fireEvent.click(screen.getByTestId(editProductSelector));
        expectEditMenuContents(true);

        fireEvent.click(screen.getByText('Archive Product'));
        expect(await screen.findByText('Are you sure?')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(await screen.queryByText('Are you sure?')).not.toBeInTheDocument();
    });

    function renderProductCard(product: Product, isReadOnly = false) {
        renderWithRecoil(
            <ProductCard product={product}/>,
            ({set}) => {
                set(ViewingDateState, mayFourteenth2020);
                set(ProductsState, products);
                set(CurrentSpaceState, TestData.space)
                set(IsReadOnlyState, isReadOnly)
            }
        );
    }
});

const expectEditMenuContents = (shown: boolean): void => {
    if (shown) {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(screen.getByText('Archive Product')).toBeInTheDocument();
    } else {
        expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
        expect(screen.queryByText('Archive Product')).not.toBeInTheDocument();
    }
};