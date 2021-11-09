package com.ford.internalprojects.peoplemover.person

import com.ford.internalprojects.peoplemover.utilities.BasicLogger
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RequestMapping("/api/people")
@RestController
class PersonSearchController (
        private val logger: BasicLogger,
        private val personService: PersonService
){
    @GetMapping("/search")
    fun search(@RequestParam(name="personName", required=false) personName: String?,
               @RequestParam(name="spaceName", required=false) spaceName: String?,
               @RequestParam(name="productName", required=false) productName: String?,
               @RequestParam(name="roleName", required=false) roleName: String?) : List<PersonSearchResponse>{

       return personService.search(PersonSearchRequest(personName, spaceName, productName, roleName));
    }
}