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

package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.auth.PERMISSION_EDITOR
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.color.ColorService
import com.ford.internalprojects.peoplemover.tag.location.LocationService
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.TagRequest
import com.ford.internalprojects.peoplemover.tag.product.ProductTagService
import com.ford.internalprojects.peoplemover.tag.role.RoleService
import com.ford.internalprojects.peoplemover.tag.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.person.PersonTag
import com.ford.internalprojects.peoplemover.tag.person.PersonTagService
import com.google.common.collect.Sets
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.sql.Timestamp
import java.time.LocalDate
import java.util.*

@Configuration
@Profile("local", "e2e-test")
class LocalDataGenerator(
    private val spaceRepository: SpaceRepository,
    private val productService: ProductService,
    private val roleService: RoleService,
    private val userSpaceMappingRepository: UserSpaceMappingRepository,
    private val colorService: ColorService,
    private val personService: PersonService,
    private val productRepository: ProductRepository,
    private val assignmentService: AssignmentService,
    private val productTagService: ProductTagService,
    private val personTagService: PersonTagService,
    private val locationService: LocationService
) {

    fun setSpace(uuid: String) {
        generateSpaceData(uuid, true)
    }

    fun resetSpace(uuid: String) {
        return generateSpaceData(uuid, false)
    }

    private fun generateSpaceData(uuid: String, addColors: Boolean) {
        val flippingSweetSpace = spaceRepository.findByUuid(uuid)
        if (flippingSweetSpace != null) {
            return
        }

        val spaceName = "Flipping Sweet"
        val createdBy = "USER_ID"
        val createdSpace: Space = spaceRepository.save(
            Space(name = spaceName, uuid = uuid, lastModifiedDate = Timestamp(Date().time), createdBy = createdBy)
        )
        productService.createDefaultProducts(createdSpace);

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = createdSpace.uuid, permission = PERMISSION_OWNER))
        userSpaceMappingRepository.save(UserSpaceMapping(userId = "BBARKER", spaceUuid = createdSpace.uuid, permission = PERMISSION_EDITOR))

        var colors = colorService.getColors()
        if (colors.isEmpty() && addColors) {
            colorService.addColors(listOf(
                "#83DDC2",
                "#81C0FA",
                "#A7E9F2",
                "#DBB5FF",
                "#FCBAE9",
                "#FFD7B3",
                "#FFEAAA",
                "#C9E9B0",
                "#FFFFFF",
                "#3A9B7E",
                "#387DBC",
                "#44AEBC",
                "#9161BE",
                "#BF62A5",
                "#D6843B",
                "#EAC040",
                "#78BA43",
                "#333333"
            ))
            colors = colorService.getColors()
        }

        val role1: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE BEST", colors[0].id)
        val role2: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE SECOND BEST (UNDERSTUDY)", colors[1].id)
        val role3: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE WURST", colors[2].id)

        val jane: Person = personService.createPerson(
            Person(
                name = "Jane Smith",
                spaceUuid = createdSpace.uuid,
                spaceRole = role1,
                customField1 = "JSMITH"
            )
        )
        val bob: Person = personService.createPerson(
            Person(
                name = "Bob Barker",
                spaceUuid = createdSpace.uuid,
                spaceRole = role2,
                customField1 = "BBARKER"
            )
        )

        val productTagAddRequest = TagRequest(
            name = "productTag1"
        )

        val personTagAddRequest = TagRequest(
            name = "personTag1"
        )

        val locationAddRequest = TagRequest(
            name = "location1"
        )

        val productTag: ProductTag = productTagService.createProductTagForSpace(productTagAddRequest, uuid)
        val personTag: PersonTag = personTagService.createPersonTagForSpace(personTagAddRequest, uuid)
        val location: SpaceLocation = locationService.addLocationToSpace(uuid, locationAddRequest)

        val productTags: Set<ProductTag> = HashSet(listOf(productTag))
        val personTags: Set<PersonTag> = HashSet(listOf(personTag))

        productRepository.save(Product(
            name = "My Product",
            tags = productTags,
            startDate = LocalDate.parse("2019-01-01"),
            spaceUuid =  createdSpace.uuid
        ))
        productRepository.save(Product(
            name = "Baguette Bakery",
            spaceLocation = location,
            startDate = LocalDate.parse("2019-01-01"),
            spaceUuid =  createdSpace.uuid
        ))

        val savedProducts: List<Product> = productRepository.findAllBySpaceUuid(createdSpace.uuid)
        val adam: Person = personService.createPerson(
            Person(
                name = "Adam Sandler",
                spaceUuid = createdSpace.uuid,
                spaceRole = role3,
                tags = personTags,
                customField1 = "ASANDLER"
            )
        )
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.parse("2019-01-01"),
            products = Sets.newHashSet(ProductPlaceholderPair(
                productId = savedProducts[1].id!!,
                placeholder = false
            ))
        ), createdSpace.uuid, jane.id!!)
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.now(),
            products = Sets.newHashSet(ProductPlaceholderPair(
                productId = savedProducts[1].id!!,
                placeholder = true
            ))
        ), createdSpace.uuid, bob.id!!)
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.parse("2020-06-01"),
            products = Sets.newHashSet()
        ), createdSpace.uuid, adam.id!!)
    }

}

