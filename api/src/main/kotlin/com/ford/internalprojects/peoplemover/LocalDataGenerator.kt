package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.assignment.AssignmentService
import com.ford.internalprojects.peoplemover.assignment.CreateAssignmentsRequest
import com.ford.internalprojects.peoplemover.assignment.ProductPlaceholderPair
import com.ford.internalprojects.peoplemover.auth.UserSpaceMapping
import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.color.ColorService
import com.ford.internalprojects.peoplemover.location.LocationAddRequest
import com.ford.internalprojects.peoplemover.location.LocationService
import com.ford.internalprojects.peoplemover.location.SpaceLocation
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonService
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.ProductService
import com.ford.internalprojects.peoplemover.producttag.ProductTag
import com.ford.internalprojects.peoplemover.producttag.ProductTagAddRequest
import com.ford.internalprojects.peoplemover.producttag.ProductTagService
import com.ford.internalprojects.peoplemover.role.RoleService
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.google.common.collect.Sets
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.sql.Timestamp
import java.time.LocalDate
import java.util.*

@Configuration
@Profile("local", "e2e-test")
class LocalDataGenerator(
    private val spaceRepository: SpaceRepository,
    private val productService: ProductService,
    private val roleService: RoleService,
    private val userSpaceMappingRepository: UserSpaceMappingRepository,
    private val colorService: ColorService,
    private val personService: PersonService,
    private val productRepository: ProductRepository,
    private val assignmentService: AssignmentService,
    private val productTagService: ProductTagService,
    private val locationService: LocationService
) {

    fun setSpace(uuid: String) {
        generateSpaceData(uuid, true)
    }

    fun resetSpace(uuid: String) {
        return generateSpaceData(uuid, false)
    }

    private fun generateSpaceData(uuid: String, addColors: Boolean) {
        val flippingSweetSpace = spaceRepository.findByUuid(uuid)
        if (flippingSweetSpace != null) {
            return
        }

        val spaceName = "Flipping Sweet"
        val createdBy = "SSQUAREP"
        val createdSpace: Space = spaceRepository.save(
            Space(name = spaceName, uuid = uuid, lastModifiedDate = Timestamp(Date().time), createdBy = createdBy)
        )
        productService.createDefaultProducts(createdSpace);

        userSpaceMappingRepository.save(UserSpaceMapping(userId = "USER_ID", spaceUuid = createdSpace.uuid))

        var colors = colorService.getColors()
        if (colors.isEmpty() && addColors) {
            colorService.addColors(listOf(
                "#81C0FA",
                "#83DDC2",
                "#A7E9F2",
                "#C9E9B0",
                "#DBB5FF",
                "#FFD7B3",
                "#FCBAE9",
                "#FFEAAA",
                "#FFFFFF"
            ))
            colors = colorService.getColors()
        }

        val role1: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE BEST", colors[0].id)
        val role2: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE SECOND BEST (UNDERSTUDY)", colors[1].id)
        val role3: SpaceRole = roleService.addRoleToSpace(createdSpace.uuid, "THE WURST", colors[2].id)

        val jane: Person = personService.createPerson(
            Person(
                name = "Jane Smith",
                spaceUuid = createdSpace.uuid,
                spaceRole = role1
            )
        )
        val bob: Person = personService.createPerson(
            Person(
                name = "Bob Barker",
                spaceUuid = createdSpace.uuid,
                spaceRole = role2
            )
        )
        val adam: Person = personService.createPerson(
            Person(
                name = "Adam Sandler",
                spaceUuid = createdSpace.uuid,
                spaceRole = role3
            )
        )

        val productTagAddRequest = ProductTagAddRequest(
            name = "productTag1"
        )

        val locationAddRequest = LocationAddRequest(
            name = "location1"
        )

        val productTag: ProductTag = productTagService.createProductTagForSpace(productTagAddRequest, uuid)
        val location: SpaceLocation = locationService.addLocationToSpace(uuid, locationAddRequest)

        val productTags: Set<ProductTag> = HashSet(listOf(productTag))

        productRepository.save(Product(
            name = "My Product",
            productTags = productTags,
            startDate = LocalDate.parse("2019-01-01"),
            spaceUuid =  createdSpace.uuid
        ))
        productRepository.save(Product(
            name = "Baguette Bakery",
            spaceLocation = location,
            startDate = LocalDate.parse("2019-01-01"),
            spaceUuid =  createdSpace.uuid
        ))

        val savedProducts: List<Product> = productRepository.findAllBySpaceUuid(createdSpace.uuid)

        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.parse("2019-01-01"),
            products = Sets.newHashSet(ProductPlaceholderPair(
                productId = savedProducts[1].id!!,
                placeholder = false
            ))
        ), createdSpace.uuid, jane.id!!)
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.now(),
            products = Sets.newHashSet(ProductPlaceholderPair(
                productId = savedProducts[1].id!!,
                placeholder = true
            ))
        ), createdSpace.uuid, bob.id!!)
        assignmentService.createAssignmentFromCreateAssignmentsRequestForDate(CreateAssignmentsRequest(
            requestedDate = LocalDate.parse("2020-06-01"),
            products = Sets.newHashSet()
        ), createdSpace.uuid, adam.id!!)
    }

}

