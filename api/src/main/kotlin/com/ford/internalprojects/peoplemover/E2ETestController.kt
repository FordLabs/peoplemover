package com.ford.internalprojects.peoplemover

import com.ford.internalprojects.peoplemover.space.SpaceService
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping

@Profile("e2e-test")
@Controller
@RequestMapping("/")
class E2ETestController(
        private val spaceService: SpaceService,
        private val localDataGenerator: LocalDataGenerator
) {

    @GetMapping
    fun returnOk(): ResponseEntity<Unit> {
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/api/reset/{uuid}")
    fun deleteTestSpace(@PathVariable uuid: String): ResponseEntity<Unit> {
        spaceService.deleteSpace(uuid)
        localDataGenerator.resetSpace(uuid)
        return ResponseEntity.ok().build()
    }
}
