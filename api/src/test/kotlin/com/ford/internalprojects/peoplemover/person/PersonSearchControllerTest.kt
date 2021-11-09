package com.ford.internalprojects.peoplemover.person

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.hamcrest.Matchers.equalTo
import org.hamcrest.core.Is.`is`
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
@SpringBootTest
@ActiveProfiles("test")
@RunWith(SpringRunner::class)
class PersonSearchControllerTest() {
    val searchUrl: String = "/api/people/search"

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Before
    fun setup(){

        val space = Space(name = "Cyberdyne Systems")
        spaceRepository.save(space);
        personRepository.save(Person(
                name = "John Connor",
        notes = "Someday he'll save the future",
        newPerson = true,
        spaceUuid = space.uuid,
        customField1 = "jconnor1"
        ));
    }

    @After
    fun teardown(){
        spaceRepository.deleteAll()
        personRepository.deleteAll()
    }

    @Test
    fun `should 401 if no authorization header`() {
       mockMvc.perform(get(searchUrl)
               .param("personName", "dontcare")).andExpect(status().isUnauthorized);
    }

    @Test
    fun `should find a 100% match by name`() {
        mockMvc.perform(get(searchUrl).header("Authorization", "Bearer GOOD_TOKEN")
                .param("personName", "John Connor"))
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()", `is`(1)))
                .andExpect(jsonPath("$[0].personFound.name", equalTo("John Connor")))
                .andExpect(jsonPath("$[0].matchPercent", equalTo(100.0)))


    }
}