package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import io.mockk.every
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.assertj.core.api.Assertions.fail
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.boot.test.mock.mockito.SpyBean
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.Instant

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class SpaceServiceTest {

    @Autowired
    lateinit var underTest: SpaceService

    @MockBean
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Before
    fun before() {
        mockkStatic(SecurityContextHolder::class)

    }

    @After
    fun after() {
        unmockkStatic(SecurityContextHolder::class)
        Mockito.clearInvocations(userSpaceMappingRepository)
    }

    @Test
    fun `getSpacesForUser should not blow up if Principal has no name`() {
        every { SecurityContextHolder.getContext().authentication.name } returns null
        try {
            underTest.getSpacesForUser()
        } catch (e: Exception) {
            fail<String>("Should not have caught an exception here")
        }
    }

    @Test
    fun `getSpacesForUser should identify a Principal by app id if no Name is available`() {
        every { SecurityContextHolder.getContext().authentication.credentials } returns Jwt("token", Instant.now(), Instant.now(), mapOf("h" to "h"), mapOf("appid" to "easyas123"))
        every { SecurityContextHolder.getContext().authentication.name } returns null
        try {
            underTest.getSpacesForUser()
        } catch (e: Exception) {
            fail<String>("Should not have caught an exception here")
        }
        Mockito.verify(userSpaceMappingRepository).findAllByUserId("easyas123")
    }
}
