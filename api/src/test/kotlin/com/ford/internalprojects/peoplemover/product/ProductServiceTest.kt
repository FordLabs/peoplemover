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
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.location.LocationService
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocation
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTag
import com.ford.internalprojects.peoplemover.tag.product.ProductTagRepository
import com.ford.internalprojects.peoplemover.tag.product.ProductTagService
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class ProductServiceTest {

    @Autowired
    lateinit var productService: ProductService

    @Autowired
    lateinit var productRepository: ProductRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @Autowired
    lateinit var locationRepository: SpaceLocationRepository

    @Autowired
    lateinit var productTagRepository: ProductTagRepository

    @Autowired
    lateinit var personRepository: PersonRepository

    @Autowired
    lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    lateinit var locationService: LocationService

    @Autowired
    lateinit var productTagService: ProductTagService

    @Autowired
    lateinit var personService: PersonService

    @After
    fun tearDown() {
        spaceRepository.deleteAll()
        productRepository.deleteAll()
        locationRepository.deleteAll()
        productTagRepository.deleteAll()
        personRepository.deleteAll()
        assignmentRepository.deleteAll()
    }

    @Test
    fun `should duplicate products`() {
        val oldSpace = spaceRepository.save(Space(name = "old space"))
        val newSpace = spaceRepository.save(Space(name = "new space"))
        val initialNames = listOf("Product 1", "Product 2")
        val initialLocationNames = listOf("Location 1", "Location 2")
        val initialTagNames = listOf("Tag 1", "Tag 2")
        val initialPersonNames = listOf("Person 1", "Person 2")
        val initialLocations = initialLocationNames.map { locationName -> locationRepository.save(SpaceLocation(name = locationName, spaceUuid = oldSpace.uuid)) }
        val initialTags = initialTagNames.map { tagName -> productTagRepository.save(ProductTag(name = tagName, spaceUuid = oldSpace.uuid)) }
        val initialPersons = initialPersonNames.map { name -> personRepository.save(Person(spaceUuid = oldSpace.uuid, name = name)) }
        val initialProducts = initialNames.mapIndexed {index, name -> productRepository.save(Product(spaceUuid = oldSpace.uuid, name = name, spaceLocation = initialLocations[index], tags = setOf(initialTags[index]))) }
        initialPersons.mapIndexed { index, person -> assignmentRepository.save(AssignmentV1(spaceUuid = oldSpace.uuid, person = person, productId = initialProducts[index].id!!))}
        initialProducts.forEach { product -> productRepository.save(product) }
        locationService.duplicate(oldSpace.uuid, newSpace.uuid)
        productTagService.duplicate(oldSpace.uuid, newSpace.uuid)
        personService.duplicate(oldSpace.uuid, newSpace.uuid)
        productService.duplicate(oldSpace.uuid, newSpace.uuid)
        val actualProducts = productRepository.findAllBySpaceUuid(newSpace.uuid)
        assertThat(actualProducts.size).isEqualTo(2)
        actualProducts.forEachIndexed { index, product ->
            assertThat(initialNames).contains(product.name)
            assertThat(product.name).isEqualTo(initialProducts[index].name)
            assertThat(product.id).isNotEqualTo(initialProducts[index].id)
            assertThat(product.spaceLocation).isEqualTo(locationRepository.findAllBySpaceUuid(newSpace.uuid).toList()[index])
            assertThat(product.tags.size).isOne()
            assertThat(product.tags.first()).isEqualTo(productTagRepository.findAllBySpaceUuid(newSpace.uuid)[index])
            assertThat(product.assignments.size).isOne()
            assertThat(product.assignments.first()).isEqualTo(assignmentRepository.findAllBySpaceUuid(newSpace.uuid)[index])
        }
    }
}
