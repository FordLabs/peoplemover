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

import com.ford.internalprojects.peoplemover.assignment.AssignmentRequest
import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.auth.AuthClient
import com.ford.internalprojects.peoplemover.color.Color
import com.ford.internalprojects.peoplemover.color.ColorService
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.role.RoleService
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceService
import com.google.common.collect.Sets.newHashSet
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.time.LocalDate
import javax.annotation.PostConstruct

@Configuration
@Profile("local")
class LocalConfig {
    @Autowired
    private lateinit var spaceService: SpaceService

    @Autowired
    private lateinit var authClient: AuthClient

    @Autowired
    private lateinit var colorService: ColorService

    @Autowired
    private lateinit var roleService: RoleService

    @Autowired
    private lateinit var personService: PersonService

    @Autowired
    private lateinit var assignmentService: AssignmentService

    @Autowired
    private lateinit var productRepository: ProductRepository

    @Value("\${authquest.client_id}")
    private lateinit var clientId: String

    @Value("\${authquest.client_secret}")
    private lateinit var clientSecret: String

    @PostConstruct
    fun onAppStartup() {
        val spaceName = "flippingsweet"
        val createdSpace: Space = spaceService.createSpaceWithName(spaceName)

        try {
            authClient.createScope(listOf(spaceName))
        } catch (exception: Exception) {
            println(exception.message)
        }

        colorService.addColors(listOf("#FFFF00", "#FF00FF", "#00FFFF"))
        val colors: List<Color?> = colorService.getColors()

        val role1: SpaceRole = roleService.addRoleToSpace(createdSpace.name, "THE BEST", colors[0]?.id)
        val role2: SpaceRole = roleService.addRoleToSpace(createdSpace.name, "THE SECOND BEST (UNDERSTUDY)", colors[1]?.id)
        val role3: SpaceRole = roleService.addRoleToSpace(createdSpace.name, "THE WURST", colors[2]?.id)

        val jane: Person = personService.createPerson(
                Person(
                        name = "Jane Smith",
                        spaceId = createdSpace.id!!,
                        spaceRole = role1
                ),
                spaceName
        )
        val bob: Person = personService.createPerson(
                Person(
                        name = "Bob Barker",
                        spaceId = createdSpace.id,
                        spaceRole = role2
                ),
                spaceName
        )
        val adam: Person = personService.createPerson(
                Person(
                        name = "Adam Sandler",
                        spaceId = createdSpace.id,
                        spaceRole = role3
                ),
                spaceName
        )

        val savedProducts: List<Product> = productRepository.findAllBySpaceId(spaceId = createdSpace.id)

        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2019-01-01"),
                person = jane,
                products = newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[0].id!!,
                        placeholder = false
                ))
        ))
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
                requestedDate = LocalDate.parse("2020-06-15"),
                person = bob,
                products = newHashSet(ProductPlaceholderPair(
                        productId = savedProducts[0].id!!,
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
