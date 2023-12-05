package com.ford.internalprojects.peoplemover.contactus

import com.slack.api.Slack
import com.slack.api.webhook.WebhookResponse
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.mockito.Mockito.anyString
import org.mockito.Mockito.mock

class SlackServiceTest {
    private val slack: Slack = mock(Slack::class.java);

    @Test
    fun `should return 200 and slack response when message was sent to slack successfully`() {
        val contactForm = ContactFormDTO("TestName", "test@test.com", "Other", "Hello There")

        val expectedResult = WebhookResponse.builder().message("").code(200).body("ok").build();
        Mockito.`when`(slack.send(anyString(), anyString())).thenReturn(expectedResult);

        val expectedWebhookUrl = "https://hooks.slack.com/services/123/456/789";
        val slackService = SlackService(slack, expectedWebhookUrl);
        val actualResponse = slackService.postToSlackChannel(contactForm);

        assertThat(actualResponse).isEqualTo(expectedResult);

        val expectedPayload = "{\"text\":\"" +
                "*Name*: TestName \n " +
                "*Email*: test@test.com \n " +
                "*User Type*: Other \n " +
                "*Message*: Hello There \"}"

        Mockito.verify(slack, Mockito.times(1)).send(expectedWebhookUrl, expectedPayload)
    }

    @Test
    fun `should return 400 with Missing Webhook Url message when no webhook url was provided`() {
        val contactForm = ContactFormDTO("TestName", "test@test.com", "Other", "Hello There");

        val slackService = SlackService(slack);
        val actualResponse = slackService.postToSlackChannel(contactForm)

        val expectedResult = WebhookResponse.builder().code(400).message("Missing Webhook Url.").build();
        assertThat(actualResponse).isEqualTo(expectedResult);

        Mockito.verify(slack, Mockito.times(0)).send(anyString(), anyString())
    }
}
