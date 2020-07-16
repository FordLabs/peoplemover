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

package com.ford.internalprojects.peoplemover.auth;


import com.ford.internalprojects.peoplemover.assignment.Assignment;
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository;
import com.ford.internalprojects.peoplemover.color.Color;
import com.ford.internalprojects.peoplemover.color.ColorRepository;
import com.ford.internalprojects.peoplemover.person.Person;
import com.ford.internalprojects.peoplemover.person.PersonRepository;
import com.ford.internalprojects.peoplemover.product.Product;
import com.ford.internalprojects.peoplemover.product.ProductRepository;
import com.ford.internalprojects.peoplemover.role.SpaceRole;
import com.ford.internalprojects.peoplemover.role.SpaceRolesRepository;
import com.ford.internalprojects.peoplemover.space.Space;
import com.ford.internalprojects.peoplemover.space.SpaceRepository;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hibernate.validator.internal.util.CollectionHelper.asSet;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest()
@RunWith(SpringRunner.class)
@ActiveProfiles({"local", "test"})
public class AuthConfigTest {

    @Autowired
    private SpaceRepository spaceRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private SpaceRolesRepository spaceRolesRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @MockBean
    private AuthClient authClient;

    @Value("${authquest.client_id}")
    private String clientId;

    @Value("${authquest.client_secret}")
    private String clientSecret;

    @After
    public void after() {
        assignmentRepository.deleteAll();
        personRepository.deleteAll();
        productRepository.deleteAll();

        colorRepository.deleteAll();
        spaceRolesRepository.deleteAll();
        spaceRepository.deleteAll();
    }

    @Test
    public void onAppStartup__should_create_default_space() {

        Space flippingsweet = spaceRepository.findByNameIgnoreCase("flippingsweet");

        List<String> colorCodes = new ArrayList<>();
        colorRepository.findAll().forEach(color -> colorCodes.add(color.getColor()));

        Set<SpaceRole> roles = spaceRolesRepository.findAllBySpaceId(flippingsweet.getId());
        Set<String> roleNames = roles.stream().map(SpaceRole::getName).collect(toSet());
        List<String> roleColors = roles.stream().map(SpaceRole::getColor).map(Color::getColor).collect(toList());


        List<Product> products = productRepository.findAllBySpaceId(flippingsweet.getId());
        List<String> productNames = products.stream().map(Product::getName).collect(toList());

        List<Person> persons = personRepository.findAllBySpaceId(flippingsweet.getId());
        List<String> personNames = persons.stream().map(Person::getName).collect(toList());

        Assignment janeAssignment = assignmentRepository.getByPersonId(persons.get(0).getId()).get(0);
        Assignment bobAssignment = assignmentRepository.getByPersonId(persons.get(1).getId()).get(0);
        Assignment adamAssignment = assignmentRepository.getByPersonId(persons.get(2).getId()).get(0);

        verify(authClient, times(1)).createScope(singletonList("flippingsweet"));
        assertThat(colorCodes).containsExactlyInAnyOrder("#FFFF00", "#FF00FF", "#00FFFF");

        assertThat(roleNames).isEqualTo(asSet("THE BEST", "THE SECOND BEST (UNDERSTUDY)", "THE WURST"));
        assertThat(roleColors).isEqualTo(colorCodes);

        assertThat(productNames).isEqualTo(asList("My Product", "unassigned", "Baguette Bakery"));
        assertThat(personNames).containsExactlyInAnyOrder("Jane Smith", "Bob Barker", "Adam Sandler");

        assertThat(janeAssignment.getProductId()).isEqualTo(products.get(0).getId());
        assertThat(bobAssignment.getProductId()).isEqualTo(products.get(0).getId());
        assertThat(adamAssignment.getProductId()).isEqualTo(products.get(1).getId());
    }

}
