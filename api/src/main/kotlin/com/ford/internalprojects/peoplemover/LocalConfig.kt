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

package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorService
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.role.RoleService
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.SpaceService
import com.ford.internalprojects.peoplemover.utilities.HelperUtils
import com.google.common.collect.Sets.newHashSet
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.time.LocalDate
import javax.annotation.PostConstruct

@Configuration
@Profile("local", "e2e-test")
class LocalConfig {
    @Autowired
    private lateinit var spaceService: SpaceService

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var colorService: ColorService

    @Autowired
    private lateinit var roleService: RoleService

    @Autowired
    private lateinit var personService: PersonService

    @Autowired
    private lateinit var assignmentService: AssignmentService

    @Autowired
    private lateinit var productService: ProductService

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @PostConstruct
    fun onAppStartup() {
        val spaceName = "flippingsweet"
        val createdSpace: Space = spaceRepository.save(
                Space(name = spaceName, uuid = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" ,lastModifiedDate = HelperUtils.currentTimeStamp)
        )
        productService.createDefaultProducts(createdSpace);

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "AQ-866ed9fa-06ca-41e7-b256-30770b98195f", spaceId = createdSpace.id))

        colorService.addColors(listOf("#FFFF00", "#FF00FF", "#00FFFF"))
        val colors: List<Color?> = colorService.getColors()

        val role1: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE BEST", colors[0]?.id)
        val role2: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE SECOND BEST (UNDERSTUDY)", colors[1]?.id)
        val role3: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE WURST", colors[2]?.id)

        val jane: Person = personService.createPerson(
                Person(
                        name = "Jane Smith",
                        spaceId = createdSpace.id!!,
                        spaceRole = role1
                ),
                createdSpace.uuid
        )
        val bob: Person = personService.createPerson(
                Person(
                        name = "Bob Barker",
                        spaceId = createdSpace.id,
                        spaceRole = role2
                ),
                createdSpace.uuid
        )
        val adam: Person = personService.createPerson(
                Person(
                        name = "Adam Sandler",
                        spaceId = createdSpace.id,
                        spaceRole = role3
                ),
                createdSpace.uuid
        )
        val myProduct: Product = productRepository.save(Product(
                name = "My Product",
                spaceId = createdSpace.id,
                startDate = LocalDate.parse("2019-01-01")
        ))
        val baguetteBakery: Product = productRepository.save(Product(
                name = "Baguette Bakery",
                spaceId = createdSpace.id,
                startDate = LocalDate.parse("2019-01-01")
        ))

        val savedProducts: List<Product> = productRepository.findAllBySpaceId(spaceId = createdSpace.id)

        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2019-01-01"),
                person = jane,
                products = newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[1].id!!,
                        placeholder = false
                ))
        ))
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2020-06-15"),
                person = bob,
                products = newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[1].id!!,
                        placeholder = true
                ))
        ))
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2020-06-01"),
                person = adam,
                products = newHashSet()
        ))
    }
}
