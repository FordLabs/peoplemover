package com.ford.internalprojects.peoplemover.contactus

import com.github.tomakehurst.wiremock.client.WireMock.*
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo
import com.github.tomakehurst.wiremock.junit5.WireMockTest
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders


@WireMockTest(httpPort = 8089)
@SpringBootTest
@AutoConfigureMockMvc
class ContactUsControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun beforeEach() {
    }

    @AfterEach
    fun afterEach() {

    }

    @Test
    @Throws(Exception::class)
    fun sendToSlackBot(infoThingy: WireMockRuntimeInfo?) {
        stubFor(
                post(urlPathEqualTo("/"))
                .withHeader("Content-Type", containing("text/plain;charset=ISO-8859-1"))
                .willReturn(ok())
        )
        val mvcResult = mockMvc
            .perform(
                MockMvcRequestBuilders
                    .post("/api/contact-us")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"name\": \"testName\"," +
                            " \"email\": \"test@test.test\", " +
                            "\"userType\": \"other\", " +
                            "\"message\": \"Hello there\"}")
            )
            .andReturn()
        verify(
            postRequestedFor(urlPathEqualTo("/"))
                .withRequestBody(
                    equalTo(
                        "{\"text\":\"Feedback received for team mockTeam. Feedback score of: :vibez_5:. Comments: I'm so HAPPY.\"}"
                    )
                )
                .withHeader("Content-Type", equalTo("text/plain;charset=ISO-8859-1"))
        )
    }
}
