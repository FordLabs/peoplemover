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

package com.ford.internalprojects.peoplemover.tag.product

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
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
class ProductTagServiceTest {

    @Autowired
    lateinit var productTagService: ProductTagService

    @Autowired
    lateinit var productTagRepository: ProductTagRepository

    @Autowired
    lateinit var spaceRepository: SpaceRepository

    @After
    fun tearDown() {
        spaceRepository.deleteAll()
        productTagRepository.deleteAll()
    }

    @Test
    fun `should duplicate productTags`() {
        val oldSpace = spaceRepository.save(Space(name = "old space"))
        val newSpace = spaceRepository.save(Space(name = "new space"))
        val initialNames = listOf("ProductTag 1", "ProductTag 2")
        val initialProductTags = initialNames.map { name -> ProductTag(spaceUuid = oldSpace.uuid, name = name) }
        initialProductTags.forEach { productTag -> productTagRepository.save(productTag) }
        productTagService.duplicate(oldSpace.uuid, newSpace.uuid)
        val actualProductTags = productTagRepository.findAllBySpaceUuid(newSpace.uuid)
        assertThat(actualProductTags.size).isEqualTo(2)
        actualProductTags.forEach { productTag ->
            assertThat(initialNames).contains(productTag.name)
        }
    }
}
