package com.ford.internalprojects.peoplemover.user

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.auth.*
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.assertj.core.api.Assertions
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.any
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.MockitoJUnitRunner
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers


@RunWith(MockitoJUnitRunner::class)
internal class UserServiceTest {
    private lateinit var userService: UserService

    @Mock
    private lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Before
    fun setUp() {
        userService = UserService(BasicLogger(), userSpaceMappingRepository)
    }

    @Test
    fun `Invite Users Request should return Ok and an empty list with a valid emails in request`() {
        val emails = listOf("userid1", "userid2", "userid3")

        `when`(userSpaceMappingRepository.save(any(UserSpaceMapping::class.java)))
                .thenReturn(UserSpaceMapping(spaceUuid = "", permission = "", userId = ""))
                .thenThrow(DataIntegrityViolationException(""))
                .thenThrow(RuntimeException())

        val exceptionEmails = userService.addUsersToSpace(emails, "")
        Assertions.assertThat(exceptionEmails).containsExactly("userid3")
        verify(userSpaceMappingRepository, times(3)).save(any(UserSpaceMapping::class.java))
    }
}
