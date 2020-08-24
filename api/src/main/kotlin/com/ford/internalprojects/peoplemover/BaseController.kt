package com.ford.internalprojects.peoplemover

import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping

@Controller
@RequestMapping("/")
class BaseController {

    @GetMapping
    fun returnOk(): ResponseEntity<Unit> {
        return ResponseEntity.ok().build()
    }
}