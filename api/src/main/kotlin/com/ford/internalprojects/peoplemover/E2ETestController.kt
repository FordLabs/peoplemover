package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.auth.UserSpaceMappingRepository
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.SpaceService
import io.jsonwebtoken.JwtBuilder
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import java.util.*

@Profile("e2e-test")
@Controller
@RequestMapping("/")
class E2ETestController(
    private val spaceRepository: SpaceRepository,
    private val userSpaceMappingRepository: UserSpaceMappingRepository,
    private val localDataGenerator: LocalDataGenerator,
    private val mockJwtDecoder: JwtDecoder
) {

    @GetMapping
    fun returnOk(): ResponseEntity<Unit> {
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/api/reset/{uuid}")
    fun deleteTestSpaces(@PathVariable uuid: String): ResponseEntity<Unit> {
        spaceRepository.deleteByUuid(uuid)

        userSpaceMappingRepository.findAllByUserId("USER_ID").let { userSpaceMappings ->
            for (space in userSpaceMappings) {
                spaceRepository.deleteByUuid(space.spaceUuid)
            }
        }
        localDataGenerator.resetSpace(uuid)
        return ResponseEntity.ok()
                .header("Set-Cookie", "accessToken=${createJWT()}")
                .build()
    }

    fun createJWT(): String? {
        val jwt = mockJwtDecoder.decode("user_token")
        val signatureAlgorithm: SignatureAlgorithm = SignatureAlgorithm.HS256

        val builder: JwtBuilder = Jwts.builder().setId(jwt.id)
                .setIssuedAt(Date(jwt.issuedAt?.toEpochMilli() ?: 0))
                .setSubject(jwt.subject.uppercase())
                .setIssuer(jwt.issuer.toString())
                .signWith(signatureAlgorithm, "sig".toByteArray())
                .setExpiration(Date(jwt.expiresAt?.toEpochMilli() ?: (Date().time + 6000)))

        return builder.compact()
    }
}
