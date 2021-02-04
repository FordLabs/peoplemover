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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ProductService(
        private val productRepository: ProductRepository,
        private val assignmentService: AssignmentService
) {
    fun findAll(): List<Product> =
            productRepository.findAll().map { it!! }

    fun findAllBySpaceUuid(spaceUuid: String): Set<Product> =
            productRepository.findAllBySpaceUuid(spaceUuid).toSet()

    fun findAllBySpaceUuidAndDate(spaceUuid: String, date: LocalDate): Set<Product> {
        val assignmentsForDate = assignmentService.getAssignmentsByDate(spaceUuid, date)
        return productRepository.findAllBySpaceUuidAndDate(spaceUuid, date).map { product ->
            product.copy(assignments = assignmentsForDate.filter { assignment ->
                assignment.productId == product.id!!
            }.toSet())
        }.toSet()
    }

    @Throws(EntityAlreadyExistsException::class)
    fun create(productAddRequest: ProductAddRequest, spaceUuid: String): Product {
        productRepository.findProductByNameAndSpaceUuid(productAddRequest.name, spaceUuid)?.let {
            throw EntityAlreadyExistsException()
        }
        return productRepository.createEntityAndUpdateSpaceLastModified(productAddRequest.toProduct(spaceUuid))
    }


    fun update(productEditRequest: ProductEditRequest, productId: Int, spaceUuid: String): Product {
        productRepository.findProductByNameAndSpaceUuid(productEditRequest.name, spaceUuid)?.let { foundProduct ->
            if (foundProduct.id != productId) {
                throw EntityAlreadyExistsException()
            }
            if (foundProduct.startDate!! < productEditRequest.startDate!!) {
                foundProduct.assignments.forEach {
                    assignmentService.changeProductStartDateForOneAssignment(it, productEditRequest.startDate)
                }
            }
        }

        val product: Product = productEditRequest.toProduct(productId, spaceUuid)
        return productRepository.updateEntityAndUpdateSpaceLastModified(product)
    }

    fun delete(productId: Int, spaceUuid: String) {
        val productToDelete = productRepository.findByIdAndSpaceUuid(productId, spaceUuid)
                ?: throw EntityNotExistsException()

        if (productToDelete.assignments.isNotEmpty()) {
            unassignPeopleFromProduct(productToDelete)
        }
        productRepository.deleteEntityAndUpdateSpaceLastModified(productId, spaceUuid)
    }

    private fun unassignPeopleFromProduct(productToDelete: Product) {
        val unassignedProduct: Product = productRepository
                .findProductByNameAndSpaceUuid("unassigned", productToDelete.spaceUuid)
                ?: throw EntityNotExistsException()

        productToDelete.assignments.forEach {
            it.productId = unassignedProduct.id!!
            assignmentService.updateAssignment(it)
        }
    }

    fun createDefaultProducts(space: Space) {
        val unassignedProduct = Product(
                name = "unassigned",
                spaceUuid = space.uuid
        )
        productRepository.createEntityAndUpdateSpaceLastModified(unassignedProduct)
    }
}
