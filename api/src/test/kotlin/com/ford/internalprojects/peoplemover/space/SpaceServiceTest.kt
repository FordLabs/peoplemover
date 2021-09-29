package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.unmockkStatic
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.fail
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.authentication.TestingAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest
@ActiveProfiles("test")
class SpaceServiceTest {

   @Autowired
   lateinit var underTest : SpaceService

    lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Test
    fun `getSpaceForUser should not blow up if Principal has no name`() {
        mockkStatic(SecurityContextHolder::class)
        every { SecurityContextHolder.getContext().authentication.name } returns null
        try {
            underTest.getSpacesForUser()
        } catch(e: Exception) {
            fail<String>("Should not have caught an exception here")
        }
        unmockkStatic(SecurityContextHolder::class)
    }
}
