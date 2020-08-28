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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.product.ProductAddRequest.Companion.toProduct
import com.ford.internalprojects.peoplemover.product.exceptions.ProductAlreadyExistsException
import com.ford.internalprojects.peoplemover.product.exceptions.ProductNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import javax.transaction.Transactional

@Service
class ProductService(
        private val productRepository: ProductRepository,
        private val assignmentService: AssignmentService,
        private val spaceRepository: SpaceRepository
) {
    fun findAll(): List<Product> {
        return productRepository.findAll().map { it!! }
    }

    fun findAllBySpaceId(spaceId: Int): List<Product> {
        return productRepository.findAllBySpaceId(spaceId);
    }

    fun findAllBySpaceUuidAndDate(spaceUuid: String, date: LocalDate): Set<Product> {
        val space = spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException()
        val assignmentsForDate = assignmentService.getAssignmentsByDate(spaceUuid, date)
        return productRepository.findAllBySpaceIdAndDate(space.id!!, date).map {product ->
            product.copy(assignments = assignmentsForDate.filter {assignment ->
                assignment.productId == product.id!!
            }.toSet())
        }.toSet()
    }

    @Throws(ProductAlreadyExistsException::class)
    fun create(productAddRequest: ProductAddRequest, spaceUuid: String): Product {
        val space : Space = spaceRepository.findByUuid(spaceUuid) ?: throw SpaceNotExistsException()
        productRepository.findProductByNameAndSpaceId(productAddRequest.name, space.id!!)?.let {
            throw ProductAlreadyExistsException()
        }
        return create(toProduct(productAddRequest, space.id))
    }

    fun create(product: Product): Product {
        return productRepository.saveAndUpdateSpaceLastModified(product)
    }

    fun update(productEditRequest: ProductEditRequest): Product {
        productRepository.findByIdOrNull(productEditRequest.id) ?: throw ProductNotExistsException()
        productRepository.findProductByNameAndSpaceId(productEditRequest.name, productEditRequest.spaceId)?.let { foundProduct ->
            if (foundProduct.id != productEditRequest.id) {
                throw ProductAlreadyExistsException()
            }
            if (foundProduct.startDate!! < productEditRequest.startDate!!) {
                foundProduct.assignments.forEach{
                    assignmentService.changeProductStartDateForOneAssignment(it, productEditRequest.startDate)
                }
            }
        }

        val product: Product = ProductEditRequest.toProduct(productEditRequest)
        return productRepository.saveAndUpdateSpaceLastModified(product)
    }

    @Transactional
    fun delete(productId: Int) {
        val productToDelete = productRepository.findByIdOrNull(productId) ?: throw ProductNotExistsException()
        if (productToDelete.assignments.isNotEmpty()) {
            unassignPeopleFromProduct(productToDelete)
        }
        productRepository.deleteAndUpdateSpaceLastModified(productToDelete)
    }

    private fun unassignPeopleFromProduct(productToDelete: Product) {
        val unassignedProduct: Product = productRepository
                .findProductByNameAndSpaceId("unassigned", productToDelete.spaceId)
                ?: throw ProductNotExistsException()

        productToDelete.assignments.forEach {
            it.productId = unassignedProduct.id!!
            assignmentService.updateAssignment(it)
        }
    }

    fun createDefaultProducts(space: Space) {
        val unassignedProduct = Product(
                name = "unassigned",
                spaceId = space.id!!
        )
        create(unassignedProduct)
    }
}