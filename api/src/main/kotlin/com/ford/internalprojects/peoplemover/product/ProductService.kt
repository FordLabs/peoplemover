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

import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.board.BoardRepository
import com.ford.internalprojects.peoplemover.board.exceptions.BoardNotExistsException
import com.ford.internalprojects.peoplemover.product.ProductAddRequest.Companion.toProduct
import com.ford.internalprojects.peoplemover.product.exceptions.ProductAlreadyExistsException
import com.ford.internalprojects.peoplemover.product.exceptions.ProductNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.*
import javax.transaction.Transactional

@Service
class ProductService(
        private val productRepository: ProductRepository,
        private val assignmentService: AssignmentService,
        private val spaceRepository: SpaceRepository,
        private val boardRepository: BoardRepository
) {
    fun findAll(): List<Product> {
        return productRepository.findAll().map { it!! }
    }

    fun findAllBySpaceIdAndDate(spaceId: Int, date: LocalDate): Set<Product> {
        return productRepository.findAllBySpaceIdAndDate(spaceId, date)
    }

    @Throws(ProductAlreadyExistsException::class)
    fun create(productAddRequest: ProductAddRequest): Product {
        productRepository.findProductByNameAndBoardId(productAddRequest.name, productAddRequest.boardId)?.let {
            throw ProductAlreadyExistsException()
        }
        val space: Space = getSpaceFromBoardId(productAddRequest.boardId)
        if (productAddRequest.spaceId == null) {
            productAddRequest.spaceId = space.id
        }
        return create(toProduct(productAddRequest))
    }

    fun create(product: Product): Product {
        return productRepository.saveAndUpdateSpaceLastModified(product)
    }

    fun update(productEditRequest: ProductEditRequest): Product {
        productRepository.findByIdOrNull(productEditRequest.id) ?: throw ProductNotExistsException()
        productRepository.findProductByNameAndBoardId(productEditRequest.name, productEditRequest.boardId)?.let { foundProduct ->
            if (foundProduct.id != productEditRequest.id) {
                throw ProductAlreadyExistsException()
            }
        }

        val space: Space = getSpaceFromBoardId(productEditRequest.boardId)
        if (productEditRequest.spaceId == null) {
            productEditRequest.spaceId = space.id
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

    @Transactional
    fun deleteForBoardId(boardId: Int) {
        val productsOnBoard = productRepository.findAllByBoardId(boardId)
        // THIS SHOULDNT BE HERE
        productsOnBoard.forEach { product -> assignmentService.deleteForProductId(product.id!!) }
        productRepository.deleteAllByBoardId(boardId)
    }

    private fun unassignPeopleFromProduct(productToDelete: Product) {
        val unassignedProduct: Product = productRepository
                .findProductByNameAndBoardId("unassigned", productToDelete.boardId)
                ?: throw ProductNotExistsException()

        productToDelete.assignments.forEach {
            it.productId = unassignedProduct.id!!
            assignmentService.updateAssignment(it)
        }
    }

    private fun setProductIdOnAssignments(assignmentsToSave: Set<Assignment>, productId: Int) {
        assignmentsToSave.forEach { assignment: Assignment -> assignment.productId = productId }
    }

    fun copyProducts(productsToCopy: List<Product>, board: Board): List<Product> {
        val createdProducts: MutableList<Product> = ArrayList()
        productsToCopy.forEach { oldProduct: Product ->
            oldProduct.boardId = board.id!!
            val savedProduct: Product = create(oldProduct)
            createdProducts.add(savedProduct)

            val assignmentsToSave = oldProduct.assignments
            setProductIdOnAssignments(assignmentsToSave, savedProduct.id!!)
            assignmentService.updateAssignments(assignmentsToSave)
        }

        return createdProducts
    }

    fun getSpaceFromBoardId(boardId: Int): Space {
        val board: Board = boardRepository.findByIdOrNull(boardId) ?: throw BoardNotExistsException()
        return spaceRepository.findByIdOrNull(board.spaceId) ?: throw SpaceNotExistsException()
    }

}