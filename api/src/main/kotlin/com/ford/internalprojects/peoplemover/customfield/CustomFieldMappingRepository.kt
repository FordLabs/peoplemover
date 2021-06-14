package com.ford.internalprojects.peoplemover.customfield

import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface CustomFieldMappingRepository: CrudRepository<CustomFieldMapping, String> {
}