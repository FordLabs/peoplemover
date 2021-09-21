package com.ford.internalprojects.peoplemover.auth

import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.fail
import org.junit.Before
import org.junit.Test
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.oauth2.jwt.Jwt
import java.time.Instant
import java.util.*

class AuthInterceptorTest {
    @MockK
    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @MockK
    lateinit var spaceRepository: SpaceRepository

    private lateinit var authInterceptor: CustomPermissionEvaluator

    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        authInterceptor = CustomPermissionEvaluator(userSpaceMappingRepository, spaceRepository)
    }

    @Test
    fun `should deny tokens that are not authenticated`() {
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = false
        val target = "target"
        assertThat(authInterceptor.hasPermission(auth, target, "unknown_permission")).isFalse()
    }
    @Test
    fun `should deny unknown permissions`() {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace")
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = true
        val target = "target"
        assertThat(authInterceptor.hasPermission(auth, target, "unknown_permission")).isFalse()
    }

    @Test(expected = SpaceNotExistsException::class)
    fun `read should throw SpaceNotExistsException if space not found`() {
        every { spaceRepository.findByUuid(any()) } returns null
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = true
        val target = "target"
        assertThat(authInterceptor.hasPermission(auth, target, "read")).isTrue()
        fail<String>("Exception should have been thrown")
    }

    @Test
    fun `read should allow if space is public`() {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace", todayViewIsPublic = true)
        val auth = TestingAuthenticationToken("Principal", "Credentials")
        auth.isAuthenticated = true
        val target = "target"
        assertThat(authInterceptor.hasPermission(auth, target, "read")).isTrue()
    }

    @Test
    fun `read should deny if token doesn't have a subject`() {
        every { spaceRepository.findByUuid(any()) } returns Space(name = "testSpace")
        every { userSpaceMappingRepository.findByUserIdAndSpaceUuid(any(), any()) } returns Optional.empty()
        val claims = mapOf("foo" to "bar")
        val credentials = Jwt("token", Instant.now(), Instant.now(), mapOf("h" to "h"), claims)
        val auth = TestingAuthenticationToken(null, credentials)
        auth.isAuthenticated = true
        val target = "target"
        assertThat(authInterceptor.hasPermission(auth, target, "read")).isFalse()
    }

//    @Test
//    fun `read should deny if user does not have permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `read should allow if user has permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `read should deny if app does not have permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `read should allow if app has permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `write should deny if user does not have permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `write should allow if user has permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `write should deny if app does not have permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `write should allow if app has permission on space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `owner should deny if user does not own space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `owner should allow if user owns space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `owner should deny if app does not own space`() {
//        fail<String>("Not Implemented")
//    }
//
//    @Test
//    fun `owner should allow if app owns space`() {
//        fail<String>("Not Implemented")
//    }
}
