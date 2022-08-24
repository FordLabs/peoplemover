package com.ford.internalprojects.peoplemover.customfield

import javax.persistence.*

@Entity
data class CustomFieldMapping(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,

    @Column(name = "reference_name")
    val referenceName: String,

    @Column(name = "vanity_name")
    val vanityName: String,

    @Column(name = "space_uuid")
    val spaceUuid: String
)