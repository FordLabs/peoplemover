package com.ford.internalprojects.peoplemover.contactus

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.slack.api.Slack
import com.slack.api.webhook.WebhookResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import org.mockito.Mockito.`when`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContactUsControllerTest {
    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var slack: Slack;

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `POST should send contact us form info to slack`() {
        val expectedResult = WebhookResponse.builder().message("").code(200).body("ok").build();
        `when`(slack.send(anyString(), anyString())).thenReturn(expectedResult);

        val request = ContactFormDTO("TestName", "test@test.com", "Other", "Hello There");

        val result = mockMvc
            .perform(
                MockMvcRequestBuilders
                    .post("/api/contact-us")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request))
            )
            .andReturn();

        val actualResult: JsonNode = objectMapper.readTree(result.response.contentAsString);

        assertThat(actualResult.get("body").asText()).isEqualTo(expectedResult.body);
        assertThat(actualResult.get("code").asInt()).isEqualTo(expectedResult.code);
        assertThat(actualResult.get("message").asText()).isEqualTo(expectedResult.message);
    }
}
