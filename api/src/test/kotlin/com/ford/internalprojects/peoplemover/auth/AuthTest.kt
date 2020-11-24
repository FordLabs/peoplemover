package com.ford.internalprojects.peoplemover.auth


import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping
import org.springframework.web.util.UriComponentsBuilder

@AutoConfigureMockMvc
@RunWith(SpringRunner::class)
@SpringBootTest
class AuthTest {
    @Autowired
    lateinit var requestMappingHandlerMapping: RequestMappingHandlerMapping

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `should reject invalid tokens on all GET endpoints with a 401`() {
        requestMappingHandlerMapping
                .handlerMethods
                .filter { it.key.methodsCondition.methods.contains(RequestMethod.GET) }
                .flatMap { it.key.patternsCondition.patterns }
                .forEach {
                    val withFakeDatesAndIntsForOtherParams = it
                            .replace("\\{[^}]*?date.*?}".toRegex(RegexOption.IGNORE_CASE), "1901-01-01")
                            .replace("\\{.*?}".toRegex(), "111")

                    mockMvc.perform(MockMvcRequestBuilders.get(withFakeDatesAndIntsForOtherParams)
                            .header("Authorization", "Bearer INVALID_TOKEN"))
                            .andExpect(MockMvcResultMatchers.status().isUnauthorized)
                }
    }

}
