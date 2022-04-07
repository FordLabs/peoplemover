package com.ford.internalprojects.peoplemover.assignment

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.auth.PERMISSION_OWNER
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.tag.location.SpaceLocationRepository
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
abstract class AssignmentControllerApiBaseTest {
    @Autowired
    protected lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    protected lateinit var productRepository: ProductRepository

    @Autowired
    protected lateinit var personRepository: PersonRepository

    @Autowired
    protected lateinit var spaceRepository: SpaceRepository

    @Autowired
    protected lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    protected lateinit var userSpaceMappingRepository: UserSpaceMappingRepository

    @Autowired
    protected lateinit var mockMvc: MockMvc

    @Autowired
    protected lateinit var objectMapper: ObjectMapper

    protected lateinit var editableSpace: Space
    protected lateinit var readOnlySpace: Space
    protected lateinit var productOne: Product
    protected lateinit var productTwo: Product
    protected lateinit var productThree: Product
    protected lateinit var productFour: Product
    protected lateinit var unassignedProduct: Product
    protected lateinit var readOnlyProductOne: Product
    protected lateinit var readOnlyProductTwo: Product
    protected lateinit var person: Person
    protected lateinit var personTwo: Person
    protected lateinit var personInReadOnlySpace: Person

    protected val march1 = "2019-03-01"
    protected val april1 = "2019-04-01"
    protected val april2 = "2019-04-02"
    protected val april3 = "2019-04-03"
    protected val today = LocalDate.now().format(DateTimeFormatter.ISO_DATE)

    @BeforeEach
    fun setup() {
        editableSpace = spaceRepository.save(Space(name = "tik"))
        readOnlySpace = spaceRepository.save(Space(name = "tok", todayViewIsPublic = true))
        productOne = productRepository.save(Product(name = "Justice League", spaceUuid = editableSpace.uuid))
        productTwo = productRepository.save(Product(name = "Avengers", spaceUuid = editableSpace.uuid))
        productThree = productRepository.save(Product(name = "Misfits", spaceUuid = editableSpace.uuid))
        productFour = productRepository.save(Product(name = "Fantastic 4", spaceUuid = editableSpace.uuid))
        unassignedProduct = productRepository.save(Product(name = "unassigned", spaceUuid = editableSpace.uuid))
        readOnlyProductOne = productRepository.save(Product(name = "Readable Product", spaceUuid = readOnlySpace.uuid))
        readOnlyProductTwo =
            productRepository.save(Product(name = "Another Readable Product", spaceUuid = readOnlySpace.uuid))
        person =
            personRepository.save(Person(name = "Benjamin Britten", newPerson = true, spaceUuid = editableSpace.uuid))
        personTwo =
            personRepository.save(Person(name = "Joey Britten", newPerson = true, spaceUuid = editableSpace.uuid))
        personInReadOnlySpace =
            personRepository.save(Person(name = "Wallace Britten", newPerson = true, spaceUuid = readOnlySpace.uuid))
        userSpaceMappingRepository.save(
            UserSpaceMapping(
                userId = "USER_ID",
                spaceUuid = editableSpace.uuid,
                permission = PERMISSION_OWNER
            )
        )
    }

    @AfterEach
    fun teardown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
    }
}