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

package com.ford.internalprojects.peoplemover.product

import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.AssignmentV1
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityAlreadyExistsException
import com.ford.internalprojects.peoplemover.baserepository.exceptions.EntityNotExistsException
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ProductService(
        private val productRepository: ProductRepository,
        private val locationRepository: SpaceLocationRepository,
        private val productTagRepository: ProductTagRepository,
        private val assignmentRepository: AssignmentRepository,
        private val personRepository: PersonRepository,
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
    fun create(productRequest: ProductRequest, spaceUuid: String): Product {
        productRepository.findProductByNameAndSpaceUuid(productRequest.name, spaceUuid)?.let {
            throw EntityAlreadyExistsException()
        }
        ensureValidUrlScheme(productRequest)
        return productRepository.createEntityAndUpdateSpaceLastModified(productRequest.toProduct(spaceUuid = spaceUuid))
    }

    private fun ensureValidUrlScheme(productRequest: ProductRequest) {
        if (!productRequest.url.isNullOrEmpty()) {
            if ((productRequest.url!!.startsWith("https://", true) || productRequest.url!!.startsWith("http:", true))) {
               return
            }
            else if (productRequest.url!!.startsWith("https:", true)) {
                productRequest.url = productRequest.url!!.replace("https:", "https://")
            }
            else {
                productRequest.url = "https://" + productRequest.url
            }
        }
    }


    fun update(productRequest: ProductRequest, productId: Int, spaceUuid: String): Product {
        productRepository.findProductByNameAndSpaceUuid(productRequest.name, spaceUuid)?.let { foundProduct ->
            if (foundProduct.id != productId) {
                throw EntityAlreadyExistsException()
            }
            if (foundProduct.startDate!! < productRequest.startDate!!) {
                foundProduct.assignments.forEach {
                    assignmentService.changeProductStartDateForOneAssignment(it, productRequest.startDate)
                }
            }
        }

        ensureValidUrlScheme(productRequest)

        val product: Product = productRequest.toProduct(productId, spaceUuid)
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

        val unassignedPeople = unassignedProduct.assignments.map { it.person.id }

        productToDelete.assignments.forEach {
            if (unassignedPeople.contains(it.person.id)) {
                assignmentService.deleteOneAssignment(it)
            } else {
                it.productId = unassignedProduct.id!!
                assignmentService.updateAssignment(it)
            }
        }
    }

    fun createDefaultProducts(space: Space) {
        val unassignedProduct = Product(
                name = "unassigned",
                spaceUuid = space.uuid
        )
        productRepository.createEntityAndUpdateSpaceLastModified(unassignedProduct)
    }

    fun duplicate(originalSpaceUuid: String, destinationSpaceUuid: String) {
        val originalProducts = findAllBySpaceUuid(originalSpaceUuid)
        val newPeople = personRepository.findAllBySpaceUuid(destinationSpaceUuid)
        originalProducts.map {originalProduct ->
            var newRole = locationRepository.findAllBySpaceUuidAndNameIgnoreCase(destinationSpaceUuid, (originalProduct.spaceLocation?.name ?: "") )
            var newTags = originalProduct.tags.map { tag -> productTagRepository.findAllBySpaceUuidAndName(destinationSpaceUuid, tag.name)}
            // Issue: Need to figure out a better way of doing this rather than hitting product and assignment repositories directly
            var newProduct = productRepository.save(Product(
                    name = originalProduct.name,
                    spaceLocation = newRole,
                    tags = newTags.toSet(),
                    spaceUuid = destinationSpaceUuid
            ))
            originalProduct.assignments.map { originalAssignment -> assignmentRepository.save(AssignmentV1(
                    productId = newProduct.id!!,
                    placeholder = originalAssignment.placeholder,
                    effectiveDate = originalAssignment.effectiveDate,
                    spaceUuid = destinationSpaceUuid,
                    // Issue: Is this enough to distinguish people?
                    person = newPeople.find { person ->
                        person.name == originalAssignment.person.name
                                && person.newPerson == originalAssignment.person.newPerson
                                && person.newPersonDate == originalAssignment.person.newPersonDate
                                && person.archiveDate == originalAssignment.person.archiveDate
                                && person.customField1 == originalAssignment.person.customField1
                                && person.notes == originalAssignment.person.notes
                                && person.spaceRole?.name == originalAssignment.person.spaceRole?.name
                                && person.tags.size == originalAssignment.person.tags.size
                                && person.tags.map { tag -> tag.name }.containsAll(originalAssignment.person.tags.map { tag -> tag.name })
                                && originalAssignment.person.tags.map { tag -> tag.name }.containsAll(person.tags.map { tag -> tag.name })
                    }!!
            ))}
        }
    }
}
